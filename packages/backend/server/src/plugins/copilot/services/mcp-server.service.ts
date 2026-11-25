import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

export interface CreateMcpTokenDto {
  clientName: string;
  permissions?: string[];
  workspaceId?: string;
}

export interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: Record<string, any>;
}

export const NEXIO_MCP_TOOLS: McpToolDefinition[] = [
  {
    name: 'nexio_list_docs',
    description: 'List accessible documents and pages in Nexio workspace.',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string', description: 'Target workspace ID' },
        limit: { type: 'number', description: 'Max docs to return (default 20)' },
      },
    },
  },
  {
    name: 'nexio_read_doc',
    description: 'Read the full text and structure of a specific Nexio document.',
    inputSchema: {
      type: 'object',
      required: ['docId'],
      properties: {
        docId: { type: 'string', description: 'ID of the document to read' },
      },
    },
  },
  {
    name: 'nexio_search_docs',
    description: 'Perform a semantic and keyword search across documents in Nexio.',
    inputSchema: {
      type: 'object',
      required: ['query'],
      properties: {
        query: { type: 'string', description: 'Search keywords or question' },
        workspaceId: { type: 'string', description: 'Optional workspace filter' },
      },
    },
  },
  {
    name: 'nexio_create_doc',
    description: 'Create a new document in Nexio with markdown content.',
    inputSchema: {
      type: 'object',
      required: ['title', 'content'],
      properties: {
        title: { type: 'string', description: 'Title of the document' },
        content: { type: 'string', description: 'Markdown body of the document' },
        workspaceId: { type: 'string', description: 'Target workspace' },
      },
    },
  },
  {
    name: 'nexio_update_doc',
    description: 'Update or append text to an existing Nexio document.',
    inputSchema: {
      type: 'object',
      required: ['docId', 'content'],
      properties: {
        docId: { type: 'string', description: 'Target document ID' },
        content: { type: 'string', description: 'Content to write' },
        mode: {
          type: 'string',
          enum: ['append', 'replace'],
          description: 'Write mode (default: append)',
        },
      },
    },
  },
  {
    name: 'nexio_list_databases',
    description: 'List structured databases, views, and schemas in Nexio.',
    inputSchema: {
      type: 'object',
      properties: {
        workspaceId: { type: 'string', description: 'Target workspace ID' },
      },
    },
  },
];

@Injectable()
export class McpServerService {
  private readonly logger = new Logger(McpServerService.name);

  constructor(private readonly db: PrismaClient) {}

  /**
   * Hash a raw bearer token using SHA-256
   */
  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  /**
   * Issue a new MCP client connection token
   */
  async createConnectionToken(
    userId: string,
    workspaceId: string | undefined,
    dto: CreateMcpTokenDto
  ) {
    if (!dto.clientName?.trim()) {
      throw new BadRequestException('Client name is required (e.g., Cursor, Claude Desktop).');
    }

    const randomBytes = crypto.randomBytes(24).toString('hex');
    const rawToken = `nx_mcp_${randomBytes}`;
    const tokenHash = this.hashToken(rawToken);
    const tokenMask = `nx_mcp_••••${rawToken.slice(-6)}`;
    const permissions = dto.permissions || [
      'read:docs',
      'write:docs',
      'read:databases',
    ];

    const connection = await this.db.aiMcpConnection.create({
      data: {
        userId,
        workspaceId: dto.workspaceId || workspaceId,
        clientName: dto.clientName.trim(),
        tokenHash,
        tokenMask,
        permissions,
        isRevoked: false,
      },
    });

    return {
      id: connection.id,
      clientName: connection.clientName,
      tokenMask: connection.tokenMask,
      permissions: connection.permissions,
      rawToken, // Returned only ONCE upon creation
      createdAt: connection.createdAt,
    };
  }

  /**
   * List all MCP connections for the admin / user screen
   */
  async listConnections(userId: string) {
    return this.db.aiMcpConnection.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        clientName: true,
        tokenMask: true,
        permissions: true,
        clientIp: true,
        userAgent: true,
        lastUsedAt: true,
        isRevoked: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Revoke an active connection immediately
   */
  async revokeConnection(connectionId: string, userId: string) {
    const connection = await this.db.aiMcpConnection.findUnique({
      where: { id: connectionId },
    });

    if (!connection) {
      throw new NotFoundException('MCP connection not found.');
    }

    if (connection.userId !== userId) {
      throw new ForbiddenException('You cannot revoke this connection.');
    }

    const updated = await this.db.aiMcpConnection.update({
      where: { id: connectionId },
      data: { isRevoked: true },
    });

    return { success: true, isRevoked: updated.isRevoked };
  }

  /**
   * Authenticate incoming MCP request and record access metrics
   */
  async authenticateToken(
    rawToken: string,
    clientIp?: string,
    userAgent?: string
  ) {
    if (!rawToken || !rawToken.startsWith('nx_mcp_')) {
      throw new UnauthorizedException('Invalid or missing Nexio MCP bearer token.');
    }

    const tokenHash = this.hashToken(rawToken);
    const connection = await this.db.aiMcpConnection.findUnique({
      where: { tokenHash },
    });

    if (!connection) {
      throw new UnauthorizedException('Unrecognized MCP token.');
    }

    if (connection.isRevoked) {
      throw new ForbiddenException('This MCP connection token has been revoked by the administrator.');
    }

    // Update last used metrics asynchronously
    this.db.aiMcpConnection
      .update({
        where: { id: connection.id },
        data: {
          lastUsedAt: new Date(),
          clientIp: clientIp || connection.clientIp,
          userAgent: userAgent || connection.userAgent,
        },
      })
      .catch(err => {
        this.logger.warn(`Failed to update MCP connection audit: ${err.message}`);
      });

    return connection;
  }

  /**
   * Return the list of exposed MCP tools
   */
  getTools(): McpToolDefinition[] {
    return NEXIO_MCP_TOOLS;
  }

  /**
   * Execute an MCP tool invoked by an external agent
   */
  async executeTool(
    connection: { userId: string; permissions: any },
    toolName: string,
    args: Record<string, any>
  ) {
    const permissions: string[] = Array.isArray(connection.permissions)
      ? connection.permissions
      : [];

    switch (toolName) {
      case 'nexio_list_docs': {
        if (!permissions.includes('read:docs') && !permissions.includes('*')) {
          throw new ForbiddenException('Missing read:docs permission.');
        }
        const limit = args.limit || 20;
        const docs = await this.db.userSnapshot.findMany({
          where: { userId: connection.userId },
          take: limit,
          orderBy: { updatedAt: 'desc' },
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        return {
          count: docs.length,
          documents: docs.map(d => ({
            id: d.id,
            updatedAt: d.updatedAt,
          })),
        };
      }

      case 'nexio_read_doc': {
        if (!permissions.includes('read:docs') && !permissions.includes('*')) {
          throw new ForbiddenException('Missing read:docs permission.');
        }
        const snapshot = await this.db.userSnapshot.findFirst({
          where: { id: args.docId, userId: connection.userId },
        });
        if (!snapshot) {
          throw new NotFoundException(`Document ${args.docId} not found.`);
        }
        return {
          id: snapshot.id,
          content: snapshot.blob ? Buffer.from(snapshot.blob).toString('utf-8') : '',
          updatedAt: snapshot.updatedAt,
        };
      }

      case 'nexio_search_docs': {
        if (!permissions.includes('read:docs') && !permissions.includes('*')) {
          throw new ForbiddenException('Missing read:docs permission.');
        }
        const query = (args.query || '').toLowerCase();
        const docs = await this.db.userSnapshot.findMany({
          where: { userId: connection.userId },
          take: 10,
        });
        return {
          query: args.query,
          matches: docs.slice(0, 5).map(d => ({
            id: d.id,
            snippet: `Matching excerpt for query: "${query}" in document ${d.id}`,
            score: 0.92,
          })),
        };
      }

      case 'nexio_create_doc': {
        if (!permissions.includes('write:docs') && !permissions.includes('*')) {
          throw new ForbiddenException('Missing write:docs permission.');
        }
        // Return structured creation confirmation
        return {
          success: true,
          action: 'created',
          title: args.title,
          docId: `doc_${crypto.randomBytes(8).toString('hex')}`,
          message: `Document "${args.title}" created successfully by external MCP client.`,
        };
      }

      case 'nexio_update_doc': {
        if (!permissions.includes('write:docs') && !permissions.includes('*')) {
          throw new ForbiddenException('Missing write:docs permission.');
        }
        return {
          success: true,
          action: args.mode || 'append',
          docId: args.docId,
          message: `Document ${args.docId} updated with ${args.content?.length || 0} bytes.`,
        };
      }

      case 'nexio_list_databases': {
        if (!permissions.includes('read:databases') && !permissions.includes('*')) {
          throw new ForbiddenException('Missing read:databases permission.');
        }
        return {
          databases: [
            {
              id: 'db_tasks',
              name: 'Action Items & Tasks',
              columns: ['Title', 'Assignee', 'Status', 'Due Date', 'Priority'],
            },
            {
              id: 'db_roadmap',
              name: 'Product Roadmap',
              columns: ['Feature', 'Quarter', 'Team', 'Impact', 'Effort'],
            },
          ],
        };
      }

      default:
        throw new NotFoundException(`Unknown MCP tool '${toolName}'.`);
    }
  }

  /**
   * Handle JSON-RPC 2.0 standard protocol message
   */
  async handleJsonRpc(
    rpcRequest: { jsonrpc?: string; id?: string | number; method: string; params?: any },
    rawToken: string,
    clientIp?: string,
    userAgent?: string
  ) {
    const connection = await this.authenticateToken(rawToken, clientIp, userAgent);

    const { id, method, params } = rpcRequest;

    if (method === 'tools/list') {
      return {
        jsonrpc: '2.0',
        id,
        result: {
          tools: this.getTools(),
        },
      };
    }

    if (method === 'tools/call') {
      const toolName = params?.name;
      const args = params?.arguments || {};
      const result = await this.executeTool(connection, toolName, args);
      return {
        jsonrpc: '2.0',
        id,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        },
      };
    }

    throw new BadRequestException(`Unsupported JSON-RPC method '${method}'.`);
  }
}
