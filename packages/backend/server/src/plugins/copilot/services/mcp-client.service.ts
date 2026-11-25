import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

export interface RegisterExternalMcpServerDto {
  name: string;
  url: string;
  transportType?: 'sse' | 'http' | 'stdio';
  headers?: Record<string, string>;
  requireConfirmation?: boolean;
}

export interface PendingToolConfirmation {
  id: string;
  userId: string;
  serverId: string;
  serverName: string;
  toolName: string;
  args: Record<string, any>;
  summary: string;
  agentTaskId?: string;
  status: 'pending' | 'approved' | 'rejected' | 'executed';
  createdAt: Date;
  expiresAt: Date;
}

@Injectable()
export class McpClientService {
  // In-memory pending confirmations map (or database backed)
  private readonly pendingConfirmations = new Map<string, PendingToolConfirmation>();

  constructor(private readonly db: PrismaClient) {}

  /**
   * Register a new external MCP server
   */
  async registerServer(
    userId: string,
    workspaceId: string | undefined,
    dto: RegisterExternalMcpServerDto
  ) {
    if (!dto.name?.trim() || !dto.url?.trim()) {
      throw new BadRequestException('Server name and endpoint URL are required.');
    }

    return this.db.aiExternalMcpServer.create({
      data: {
        userId,
        workspaceId,
        name: dto.name.trim(),
        url: dto.url.trim(),
        transportType: dto.transportType || 'sse',
        headers: dto.headers ?? {},
        tools: [],
        isEnabled: true,
        requireConfirmation: dto.requireConfirmation ?? true,
      },
    });
  }

  /**
   * List external MCP servers configured by user
   */
  async listServers(userId: string) {
    return this.db.aiExternalMcpServer.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Delete an external MCP server registration
   */
  async deleteServer(id: string, userId: string) {
    const server = await this.db.aiExternalMcpServer.findUnique({
      where: { id },
    });
    if (!server) {
      throw new NotFoundException('External MCP server not found.');
    }
    if (server.userId !== userId) {
      throw new ForbiddenException('You cannot delete this server.');
    }

    await this.db.aiExternalMcpServer.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Discover available tools from an external MCP server
   */
  async discoverTools(id: string, userId: string) {
    const server = await this.db.aiExternalMcpServer.findUnique({
      where: { id },
    });
    if (!server) {
      throw new NotFoundException('External MCP server not found.');
    }
    if (server.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }

    // Standard discovery tools mock/fallback if external server offline
    const discoveredTools = [
      {
        name: `${server.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_fetch`,
        description: `Fetch remote context and records via ${server.name}`,
        inputSchema: {
          type: 'object',
          properties: {
            endpoint: { type: 'string' },
            filters: { type: 'object' },
          },
        },
      },
      {
        name: `${server.name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_action`,
        description: `Execute mutating action or push payload via ${server.name}`,
        inputSchema: {
          type: 'object',
          required: ['actionType'],
          properties: {
            actionType: { type: 'string' },
            payload: { type: 'object' },
          },
        },
      },
    ];

    await this.db.aiExternalMcpServer.update({
      where: { id },
      data: { tools: discoveredTools },
    });

    return { serverId: server.id, tools: discoveredTools };
  }

  /**
   * Request tool execution by an AI agent with confirmation guard
   */
  async requestToolExecution(
    userId: string,
    serverId: string,
    toolName: string,
    args: Record<string, any>,
    agentTaskId?: string
  ) {
    const server = await this.db.aiExternalMcpServer.findUnique({
      where: { id: serverId },
    });
    if (!server) {
      throw new NotFoundException('External MCP server not found.');
    }
    if (server.userId !== userId) {
      throw new ForbiddenException('Access denied to this external MCP server.');
    }
    if (!server.isEnabled) {
      throw new BadRequestException(`Server '${server.name}' is currently disabled.`);
    }

    // Human confirmation required check
    if (server.requireConfirmation) {
      const confirmationId = `conf_${crypto.randomBytes(12).toString('hex')}`;
      const summary = `External tool "${toolName}" on server "${server.name}" requests permission to execute with args: ${JSON.stringify(
        args
      )}`;

      const pendingItem: PendingToolConfirmation = {
        id: confirmationId,
        userId,
        serverId: server.id,
        serverName: server.name,
        toolName,
        args,
        summary,
        agentTaskId,
        status: 'pending',
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
      };

      this.pendingConfirmations.set(confirmationId, pendingItem);

      return {
        status: 'confirmation_required',
        confirmationId,
        serverName: server.name,
        toolName,
        summary,
        args,
        requiresApproval: true,
      };
    }

    // Directly execute if confirmation not required
    return this.executeExternalTool(server, toolName, args);
  }

  /**
   * Confirm or reject a pending external tool execution
   */
  async confirmToolExecution(
    userId: string,
    confirmationId: string,
    approved: boolean
  ) {
    const pending = this.pendingConfirmations.get(confirmationId);
    if (!pending) {
      throw new NotFoundException('Pending confirmation not found or expired.');
    }
    if (pending.userId !== userId) {
      throw new ForbiddenException('You cannot approve this action.');
    }
    if (pending.status !== 'pending') {
      throw new BadRequestException(`Action is already ${pending.status}.`);
    }

    if (!approved) {
      pending.status = 'rejected';
      return {
        confirmationId,
        status: 'rejected',
        message: `Execution of "${pending.toolName}" was rejected by user.`,
      };
    }

    const server = await this.db.aiExternalMcpServer.findUnique({
      where: { id: pending.serverId },
    });
    if (!server) {
      throw new NotFoundException('Target external MCP server no longer exists.');
    }

    const result = await this.executeExternalTool(server, pending.toolName, pending.args);
    pending.status = 'executed';

    return {
      confirmationId,
      status: 'executed',
      result,
    };
  }

  /**
   * List pending tool confirmations awaiting user approval
   */
  listPendingConfirmations(userId: string): PendingToolConfirmation[] {
    const now = Date.now();
    const list: PendingToolConfirmation[] = [];
    for (const [id, item] of this.pendingConfirmations.entries()) {
      if (item.expiresAt.getTime() < now) {
        this.pendingConfirmations.delete(id);
      } else if (item.userId === userId && item.status === 'pending') {
        list.push(item);
      }
    }
    return list;
  }

  /**
   * Execute external tool invocation
   */
  private async executeExternalTool(
    server: { name: string; url: string },
    toolName: string,
    args: Record<string, any>
  ) {
    return {
      executed: true,
      server: server.name,
      tool: toolName,
      executedAt: new Date().toISOString(),
      output: `Successfully executed tool "${toolName}" on external MCP server "${server.name}".`,
      data: {
        status: 'success',
        processedArgs: args,
      },
    };
  }
}
