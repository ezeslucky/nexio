import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface SetColumnPermissionDto {
  databaseId: string;
  propertyId: string;
  propertyName: string;
  workspaceId?: string;
  allowedRoles?: string[];
  allowedAgents?: string[];
  allowedUsers?: string[];
  canView?: boolean;
  canEdit?: boolean;
}

export interface PermissionContext {
  userId?: string;
  userRole?: string;
  agentId?: string;
}

@Injectable()
export class ColumnPermissionService {
  constructor(private readonly db: PrismaClient) {}

  /**
   * List all column/property permissions for a database
   */
  async listPermissions(databaseId: string) {
    return this.db.aiDatabaseColumnPermission.findMany({
      where: { databaseId },
      orderBy: { propertyName: 'asc' },
    });
  }

  /**
   * Set or update permissions on a specific column/property
   */
  async setPermission(createdBy: string, dto: SetColumnPermissionDto) {
    if (!dto.databaseId || !dto.propertyId || !dto.propertyName) {
      throw new BadRequestException('databaseId, propertyId, and propertyName are required.');
    }

    const existing = await this.db.aiDatabaseColumnPermission.findFirst({
      where: { databaseId: dto.databaseId, propertyId: dto.propertyId },
    });

    const allowedRoles = dto.allowedRoles ?? ['owner', 'admin'];
    const allowedAgents = dto.allowedAgents ?? [];
    const allowedUsers = dto.allowedUsers ?? [];

    if (existing) {
      return this.db.aiDatabaseColumnPermission.update({
        where: { id: existing.id },
        data: {
          propertyName: dto.propertyName,
          allowedRoles,
          allowedAgents,
          allowedUsers,
          canView: dto.canView ?? existing.canView,
          canEdit: dto.canEdit ?? existing.canEdit,
        },
      });
    }

    return this.db.aiDatabaseColumnPermission.create({
      data: {
        databaseId: dto.databaseId,
        propertyId: dto.propertyId,
        propertyName: dto.propertyName,
        workspaceId: dto.workspaceId,
        createdBy,
        allowedRoles,
        allowedAgents,
        allowedUsers,
        canView: dto.canView ?? true,
        canEdit: dto.canEdit ?? true,
      },
    });
  }

  /**
   * Remove column permission restriction
   */
  async deletePermission(id: string) {
    const existing = await this.db.aiDatabaseColumnPermission.findUnique({
      where: { id },
    });
    if (!existing) {
      throw new NotFoundException('Permission rule not found.');
    }

    await this.db.aiDatabaseColumnPermission.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Check if caller has view access to a column
   */
  hasViewAccess(
    perm: {
      allowedRoles: any;
      allowedAgents: any;
      allowedUsers?: any;
      canView: boolean;
    },
    context: PermissionContext
  ): boolean {
    if (perm.canView) return true;

    // Check agent access
    if (context.agentId) {
      const allowedAgents: string[] = Array.isArray(perm.allowedAgents)
        ? (perm.allowedAgents as string[])
        : [];
      return allowedAgents.includes(context.agentId) || allowedAgents.includes('*');
    }

    // Check user role
    const role = context.userRole || 'member';
    if (role === 'owner' || role === 'admin') return true;

    const allowedRoles: string[] = Array.isArray(perm.allowedRoles)
      ? (perm.allowedRoles as string[])
      : [];
    if (allowedRoles.includes(role)) return true;

    // Check user ID
    if (context.userId && Array.isArray(perm.allowedUsers)) {
      return (perm.allowedUsers as string[]).includes(context.userId);
    }

    return false;
  }

  /**
   * Check if caller has edit access to a column
   */
  hasEditAccess(
    perm: {
      allowedRoles: any;
      allowedAgents: any;
      allowedUsers?: any;
      canEdit: boolean;
    },
    context: PermissionContext
  ): boolean {
    if (perm.canEdit) return true;

    // Check agent edit access
    if (context.agentId) {
      const allowedAgents: string[] = Array.isArray(perm.allowedAgents)
        ? (perm.allowedAgents as string[])
        : [];
      return allowedAgents.includes(context.agentId) || allowedAgents.includes('*');
    }

    // Check user role
    const role = context.userRole || 'member';
    if (role === 'owner' || role === 'admin') return true;

    const allowedRoles: string[] = Array.isArray(perm.allowedRoles)
      ? (perm.allowedRoles as string[])
      : [];
    if (allowedRoles.includes(role)) return true;

    if (context.userId && Array.isArray(perm.allowedUsers)) {
      return (perm.allowedUsers as string[]).includes(context.userId);
    }

    return false;
  }

  /**
   * Server-side read filter: redacts unauthorized property columns
   */
  async filterRecordProperties(
    databaseId: string,
    record: Record<string, any>,
    context: PermissionContext
  ): Promise<Record<string, any>> {
    const permissions = await this.listPermissions(databaseId);
    if (!permissions.length) return record;

    const filtered: Record<string, any> = { ...record };

    for (const perm of permissions) {
      const propKey = perm.propertyId;
      const propName = perm.propertyName;

      const hasAccess = this.hasViewAccess(perm, context);

      if (!hasAccess) {
        if (propKey in filtered) {
          filtered[propKey] = '[REDACTED: PERMISSION DENIED]';
        }
        if (propName in filtered) {
          filtered[propName] = '[REDACTED: PERMISSION DENIED]';
        }
      }
    }

    return filtered;
  }

  /**
   * Server-side write validation: prevents unauthorized property updates
   */
  async validatePropertyEdits(
    databaseId: string,
    updates: Record<string, any>,
    context: PermissionContext
  ) {
    const permissions = await this.listPermissions(databaseId);
    if (!permissions.length) return;

    const unauthorizedProps: string[] = [];

    for (const perm of permissions) {
      const hasKey = perm.propertyId in updates || perm.propertyName in updates;
      if (hasKey) {
        const canEdit = this.hasEditAccess(perm, context);
        if (!canEdit) {
          unauthorizedProps.push(perm.propertyName || perm.propertyId);
        }
      }
    }

    if (unauthorizedProps.length > 0) {
      const caller = context.agentId ? `Agent '${context.agentId}'` : 'You';
      throw new ForbiddenException({
        code: 'PROPERTY_PERMISSION_DENIED',
        message: `${caller} do not have permission to edit restricted property: [${unauthorizedProps.join(', ')}].`,
        restrictedProperties: unauthorizedProps,
      });
    }
  }
}
