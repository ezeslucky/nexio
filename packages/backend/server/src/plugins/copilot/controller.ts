import {
  BeforeApplicationShutdown,
  Body,
  Controller,
  Delete,
  Get,
  Logger,
  Optional,
  Param,
  Post,
  Put,
  Query,
  Req,
  Res,
  Sse,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import {
  BehaviorSubject,
  catchError,
  filter,
  finalize,
  from,
  interval,
  lastValueFrom,
  map,
  merge,
  Observable,
  Subject,
  take,
  takeUntil,
} from 'rxjs';

import {
  CallMetric,
  Config,
  mapSseError,
  metrics,
  UnsplashIsNotConfigured,
} from '../../base';
import { CurrentUser } from '../../core/auth';
import { CopilotEnabled } from './feature';
import {
  ActionStreamHost,
  projectActionEventToChatEvent,
} from './runtime/hosts/action-stream-host';
import { TurnOrchestrator } from './runtime/turn-orchestrator';
import {
  AgentService,
  ByokService,
  ColumnPermissionService,
  CommandCenterService,
  CreditService,
  McpClientService,
  McpServerService,
  ModelRegistryService,
  ModelRouterService,
  SkillService,
  VersionHistoryService,
} from './services';
import { getSignal } from './utils';

export interface ChatEvent {
  type: 'event' | 'attachment' | 'message' | 'error' | 'ping';
  id?: string;
  data: string | object;
}

const PING_INTERVAL = 5000;

@CopilotEnabled()
@Controller('/api/copilot')
export class CopilotController implements BeforeApplicationShutdown {
  private readonly logger = new Logger(CopilotController.name);
  private readonly ongoingStreamCount$ = new BehaviorSubject(0);

  private readonly modelRegistry: ModelRegistryService;
  private readonly modelRouter: ModelRouterService;
  private readonly byokService: ByokService;
  private readonly creditService: CreditService;
  private readonly agentService: AgentService;
  private readonly skillService: SkillService;
  private readonly mcpServerService: McpServerService;
  private readonly mcpClientService: McpClientService;
  private readonly commandCenterService: CommandCenterService;
  private readonly versionHistoryService: VersionHistoryService;
  private readonly columnPermissionService: ColumnPermissionService;

  constructor(
    private readonly config: Config,
    private readonly orchestrator: TurnOrchestrator,
    private readonly actionStreams: ActionStreamHost,
    @Optional() modelRegistry?: ModelRegistryService,
    @Optional() modelRouter?: ModelRouterService,
    @Optional() byokService?: ByokService,
    @Optional() creditService?: CreditService,
    @Optional() agentService?: AgentService,
    @Optional() skillService?: SkillService,
    @Optional() mcpServerService?: McpServerService,
    @Optional() mcpClientService?: McpClientService,
    @Optional() commandCenterService?: CommandCenterService,
    @Optional() versionHistoryService?: VersionHistoryService,
    @Optional() columnPermissionService?: ColumnPermissionService
  ) {
    this.modelRegistry = modelRegistry ?? new ModelRegistryService();
    this.modelRouter =
      modelRouter ?? new ModelRouterService(this.modelRegistry);
    this.byokService = byokService ?? ({} as ByokService);
    this.creditService = creditService ?? ({} as CreditService);
    this.agentService = agentService ?? ({} as AgentService);
    this.skillService = skillService ?? ({} as SkillService);
    this.mcpServerService = mcpServerService ?? ({} as McpServerService);
    this.mcpClientService = mcpClientService ?? ({} as McpClientService);
    this.commandCenterService =
      commandCenterService ?? ({} as CommandCenterService);
    this.versionHistoryService =
      versionHistoryService ?? ({} as VersionHistoryService);
    this.columnPermissionService =
      columnPermissionService ?? ({} as ColumnPermissionService);
  }

  @Get('/models')
  async getModels() {
    return {
      models: this.modelRegistry.getModels(),
      default: this.modelRegistry.getDefaultModel(),
    };
  }

  @Post('/route')
  async routeTask(
    @Body()
    body: {
      prompt?: string;
      messages?: Array<{ role: string; content: string }>;
      requestedModel?: string;
      priority?: 'speed' | 'quality' | 'cost';
    }
  ) {
    return this.modelRouter.route(
      {
        prompt: body.prompt,
        messages: body.messages,
        priority: body.priority,
      },
      body.requestedModel
    );
  }

  @Get('/byok')
  async getByokKeys(@CurrentUser() user: CurrentUser) {
    const keys = await this.byokService.getUserKeys(user.id);
    return { keys };
  }

  @Post('/byok')
  async saveByokKey(
    @CurrentUser() user: CurrentUser,
    @Body() body: { provider: string; apiKey: string }
  ) {
    const keyInfo = await this.byokService.saveKey(
      user.id,
      body.provider,
      body.apiKey
    );
    return { success: true, key: keyInfo };
  }

  @Delete('/byok/:provider')
  async deleteByokKey(
    @CurrentUser() user: CurrentUser,
    @Param('provider') provider: string
  ) {
    await this.byokService.deleteKey(user.id, provider);
    return { success: true };
  }

  @Get('/credits')
  async getCredits(@CurrentUser() user: CurrentUser) {
    const account = await this.creditService.getOrCreateAccount(user.id);
    const transactions = await this.creditService.getRecentTransactions(
      user.id,
      15
    );
    return {
      balance: account.balance,
      lifetimeUsed: account.lifetimeUsed,
      transactions,
    };
  }

  // Agent Endpoints (Phase 2)
  @Get('/agents')
  async listAgents(
    @CurrentUser() user: CurrentUser,
    @Query('workspaceId') workspaceId?: string
  ) {
    const agents = await this.agentService.listAgents(user.id, workspaceId);
    return { agents };
  }

  @Post('/agents')
  async createAgent(
    @CurrentUser() user: CurrentUser,
    @Body()
    body: {
      name: string;
      description?: string;
      systemPrompt: string;
      modelId?: string;
      isReviewRequired?: boolean;
      subAgents?: string[];
      tools?: string[];
      workspaceId?: string;
    }
  ) {
    const agent = await this.agentService.createAgent(
      user.id,
      body.workspaceId,
      body
    );
    return { success: true, agent };
  }

  @Get('/agents/:id')
  async getAgent(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string
  ) {
    const agent = await this.agentService.getAgent(id, user.id);
    return { agent };
  }

  @Put('/agents/:id')
  async updateAgent(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string,
    @Body() body: any
  ) {
    const agent = await this.agentService.updateAgent(id, user.id, body);
    return { success: true, agent };
  }

  @Delete('/agents/:id')
  async deleteAgent(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string
  ) {
    await this.agentService.deleteAgent(id, user.id);
    return { success: true };
  }

  @Post('/agents/:id/tasks')
  async dispatchTask(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string,
    @Body()
    body: {
      input: string;
      contextDocId?: string;
      workspaceId?: string;
    }
  ) {
    return await this.agentService.dispatchTask(user.id, {
      agentId: id,
      input: body.input,
      contextDocId: body.contextDocId,
      workspaceId: body.workspaceId,
    });
  }

  @Get('/tasks')
  async listTasks(
    @CurrentUser() user: CurrentUser,
    @Query('limit') limit?: string
  ) {
    const tasks = await this.agentService.listTasks(
      user.id,
      limit ? parseInt(limit, 10) : 20
    );
    return { tasks };
  }

  @Get('/tasks/:id')
  async getTask(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string
  ) {
    const task = await this.agentService.getTask(id, user.id);
    return { task };
  }

  @Post('/tasks/:id/approve')
  async approveTask(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string
  ) {
    const task = await this.agentService.approveTask(id, user.id);
    return { success: true, task };
  }

  @Post('/tasks/:id/reject')
  async rejectTask(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string,
    @Body() body: { reason?: string }
  ) {
    const task = await this.agentService.rejectTask(id, user.id, body?.reason);
    return { success: true, task };
  }

  // Skills Library Endpoints (Phase 3)
  @Get('/skills')
  async listSkills(
    @CurrentUser() user: CurrentUser,
    @Query('workspaceId') workspaceId?: string
  ) {
    const skills = await this.skillService.listSkills(user.id, workspaceId);
    return { skills };
  }

  @Post('/skills')
  async createSkill(
    @CurrentUser() user: CurrentUser,
    @Body() body: any
  ) {
    const skill = await this.skillService.createSkill(
      user.id,
      body.workspaceId,
      body
    );
    return { success: true, skill };
  }

  @Post('/skills/import')
  async importSkill(
    @CurrentUser() user: CurrentUser,
    @Body() body: { rawContent: string; workspaceId?: string }
  ) {
    const parsed = this.skillService.parseSkillMd(body.rawContent);
    const skill = await this.skillService.createSkill(
      user.id,
      body.workspaceId,
      parsed
    );
    return { success: true, skill };
  }

  @Get('/skills/:id')
  async getSkill(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string
  ) {
    const skill = await this.skillService.getSkill(id, user.id);
    return { skill };
  }

  @Get('/skills/:id/export')
  async exportSkill(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string
  ) {
    const skill = await this.skillService.getSkill(id, user.id);
    const markdown = this.skillService.exportSkillMd(skill);
    return {
      skillId: skill.id,
      slug: skill.slug,
      filename: `${skill.slug}.SKILL.md`,
      markdown,
    };
  }

  @Put('/skills/:id')
  async updateSkill(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string,
    @Body() body: any
  ) {
    const skill = await this.skillService.updateSkill(id, user.id, body);
    return { success: true, skill };
  }

  @Delete('/skills/:id')
  async deleteSkill(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string
  ) {
    await this.skillService.deleteSkill(id, user.id);
    return { success: true };
  }

  @Post('/skills/execute')
  async executeSkill(
    @CurrentUser() user: CurrentUser,
    @Body() body: { slug: string; input: string }
  ) {
    return await this.skillService.executeSkill(body.slug, body.input, user.id);
  }

  // MCP Server for Nexio (Phase 3)
  @Get('/mcp/server/tools')
  async listMcpServerTools() {
    return { tools: this.mcpServerService.getTools() };
  }

  @Get('/mcp/server/connections')
  async listMcpConnections(@CurrentUser() user: CurrentUser) {
    const connections = await this.mcpServerService.listConnections(user.id);
    return { connections };
  }

  @Post('/mcp/server/tokens')
  async createMcpToken(
    @CurrentUser() user: CurrentUser,
    @Body()
    body: {
      clientName: string;
      permissions?: string[];
      workspaceId?: string;
    }
  ) {
    const result = await this.mcpServerService.createConnectionToken(
      user.id,
      body.workspaceId,
      body
    );
    return { success: true, ...result };
  }

  @Post('/mcp/server/revoke/:id')
  async revokeMcpConnection(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string
  ) {
    return await this.mcpServerService.revokeConnection(id, user.id);
  }

  @Post('/mcp/rpc')
  async handleMcpRpc(@Req() req: Request, @Body() body: any) {
    const authHeader = req.headers['authorization'] || '';
    const rawToken = authHeader.replace(/^Bearer\s+/i, '');
    const clientIp =
      (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress;
    const userAgent = req.headers['user-agent'];

    return await this.mcpServerService.handleJsonRpc(
      body,
      rawToken,
      clientIp,
      userAgent
    );
  }

  // MCP Client for External Tools (Phase 3)
  @Get('/mcp/client/servers')
  async listExternalMcpServers(@CurrentUser() user: CurrentUser) {
    const servers = await this.mcpClientService.listServers(user.id);
    return { servers };
  }

  @Post('/mcp/client/servers')
  async registerExternalMcpServer(
    @CurrentUser() user: CurrentUser,
    @Body() body: any
  ) {
    const server = await this.mcpClientService.registerServer(
      user.id,
      body.workspaceId,
      body
    );
    return { success: true, server };
  }

  @Delete('/mcp/client/servers/:id')
  async deleteExternalMcpServer(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string
  ) {
    return await this.mcpClientService.deleteServer(id, user.id);
  }

  @Post('/mcp/client/servers/:id/discover')
  async discoverExternalTools(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string
  ) {
    return await this.mcpClientService.discoverTools(id, user.id);
  }

  @Post('/mcp/client/execute')
  async requestExternalToolExecution(
    @CurrentUser() user: CurrentUser,
    @Body()
    body: {
      serverId: string;
      toolName: string;
      args: Record<string, any>;
      agentTaskId?: string;
    }
  ) {
    return await this.mcpClientService.requestToolExecution(
      user.id,
      body.serverId,
      body.toolName,
      body.args,
      body.agentTaskId
    );
  }

  @Get('/mcp/client/confirmations')
  async listPendingMcpConfirmations(@CurrentUser() user: CurrentUser) {
    const confirmations = this.mcpClientService.listPendingConfirmations(user.id);
    return { confirmations };
  }

  @Post('/mcp/client/confirmations/:id/respond')
  async respondToMcpConfirmation(
    @CurrentUser() user: CurrentUser,
    @Param('id') id: string,
    @Body() body: { approved: boolean }
  ) {
    return await this.mcpClientService.confirmToolExecution(
      user.id,
      id,
      body.approved
    );
  }

  // Phase 4: AI Command Center (Admin Analytics & Governance)
  @Get('/command-center/overview')
  async getUsageOverview(@Query('workspaceId') workspaceId?: string) {
    return await this.commandCenterService.getUsageOverview(workspaceId);
  }

  @Get('/command-center/limits')
  async getSpendingLimit(
    @CurrentUser() user: CurrentUser,
    @Query('workspaceId') workspaceId?: string
  ) {
    return await this.commandCenterService.getSpendingLimit(
      user.id,
      workspaceId
    );
  }

  @Post('/command-center/limits')
  async updateSpendingLimit(
    @CurrentUser() user: CurrentUser,
    @Body() body: any
  ) {
    const updated = await this.commandCenterService.updateSpendingLimit(
      user.id,
      body.workspaceId,
      body
    );
    return { success: true, limit: updated };
  }

  @Get('/command-center/policies')
  async getWorkspacePolicy(@Query('workspaceId') workspaceId: string) {
    return await this.commandCenterService.getWorkspacePolicy(
      workspaceId || 'default'
    );
  }

  @Post('/command-center/policies')
  async updateWorkspacePolicy(@Body() body: any) {
    const updated = await this.commandCenterService.updateWorkspacePolicy(
      body.workspaceId || 'default',
      body
    );
    return { success: true, policy: updated };
  }

  // Phase 4: Version History & Attribution
  @Get('/documents/:docId/history')
  async getDocumentHistory(
    @Param('docId') docId: string,
    @Query('limit') limit?: string
  ) {
    const history = await this.versionHistoryService.getDocumentHistory(
      docId,
      limit ? parseInt(limit, 10) : 30
    );
    return { history };
  }

  @Get('/documents/history/:historyId/diff')
  async getRevisionDiff(@Param('historyId') historyId: string) {
    return await this.versionHistoryService.getRevisionDiff(historyId);
  }

  @Post('/documents/:docId/history')
  async recordDocumentChange(
    @CurrentUser() user: CurrentUser,
    @Param('docId') docId: string,
    @Body() body: any
  ) {
    const record = await this.versionHistoryService.recordChange({
      ...body,
      docId,
      userId: user.id,
    });
    return { success: true, record };
  }

  @Post('/documents/history/:historyId/restore')
  async restoreDocumentRevision(
    @CurrentUser() user: CurrentUser,
    @Param('historyId') historyId: string
  ) {
    return await this.versionHistoryService.restoreRevision(
      historyId,
      user.id,
      user.email || 'User'
    );
  }

  // Phase 4: Column / Property Permissions
  @Get('/databases/:databaseId/permissions')
  async listColumnPermissions(@Param('databaseId') databaseId: string) {
    const permissions =
      await this.columnPermissionService.listPermissions(databaseId);
    return { permissions };
  }

  @Post('/databases/:databaseId/permissions')
  async setColumnPermission(
    @CurrentUser() user: CurrentUser,
    @Param('databaseId') databaseId: string,
    @Body() body: any
  ) {
    const perm = await this.columnPermissionService.setPermission(user.id, {
      ...body,
      databaseId,
    });
    return { success: true, permission: perm };
  }

  @Delete('/databases/permissions/:id')
  async deleteColumnPermission(@Param('id') id: string) {
    return await this.columnPermissionService.deletePermission(id);
  }

  @Post('/databases/:databaseId/filter-record')
  async filterRecordProperties(
    @CurrentUser() user: CurrentUser,
    @Param('databaseId') databaseId: string,
    @Body() body: { record: Record<string, any>; userRole?: string; agentId?: string }
  ) {
    const filtered = await this.columnPermissionService.filterRecordProperties(
      databaseId,
      body.record,
      {
        userId: user.id,
        userRole: body.userRole,
        agentId: body.agentId,
      }
    );
    return { record: filtered };
  }

  @Post('/databases/:databaseId/validate-edits')
  async validatePropertyEdits(
    @CurrentUser() user: CurrentUser,
    @Param('databaseId') databaseId: string,
    @Body() body: { updates: Record<string, any>; userRole?: string; agentId?: string }
  ) {
    await this.columnPermissionService.validatePropertyEdits(
      databaseId,
      body.updates,
      {
        userId: user.id,
        userRole: body.userRole,
        agentId: body.agentId,
      }
    );
    return { success: true, allowed: true };
  }

  async beforeApplicationShutdown() {
    await lastValueFrom(
      this.ongoingStreamCount$.asObservable().pipe(
        filter(count => count === 0),
        take(1)
      )
    );
    this.ongoingStreamCount$.complete();
  }

  private mergePingStream(
    messageId: string,
    source$: Observable<ChatEvent>
  ): Observable<ChatEvent> {
    const subject$ = new Subject();
    const ping$ = interval(PING_INTERVAL).pipe(
      map(() => ({ type: 'ping' as const, id: messageId, data: '' })),
      takeUntil(subject$)
    );

    return merge(source$.pipe(finalize(() => subject$.next(null))), ping$);
  }

  private toMessageEvent(messageId: string | undefined, data: string | object) {
    return { type: 'message' as const, id: messageId, data };
  }

  private toAttachmentEvent(messageId: string | undefined, data: string) {
    return { type: 'attachment' as const, id: messageId, data };
  }

  @Sse('/chat/:sessionId/stream')
  @CallMetric('ai', 'chat_stream', { timer: true })
  async chatStream(
    @CurrentUser() user: CurrentUser,
    @Req() req: Request,
    @Param('sessionId') sessionId: string,
    @Query() query: Record<string, string>
  ): Promise<Observable<ChatEvent>> {
    try {
      const { signal, onConnectionClosed } = getSignal(req);
      let endBeforePromiseResolve = false;
      onConnectionClosed(isAborted => {
        if (isAborted) {
          endBeforePromiseResolve = true;
        }
      });

      // Credit check & deduction (BYOK users are exempt)
      const targetModel = query.modelId || 'auto';
      if (this.byokService?.getUserKeys && this.creditService?.deductCredits) {
        const userByok = await this.byokService.getUserKeys(user.id);
        const hasActiveByok = userByok.some(k => k.isValid);

        if (!hasActiveByok) {
          await this.creditService.deductCredits({
            userId: user.id,
            modelId: targetModel,
            feature: 'chat',
            metadata: { sessionId },
          });
        }
      }

      const prepared = await this.orchestrator.streamText(
        user.id,
        sessionId,
        query,
        signal,
        () => endBeforePromiseResolve
      );

      metrics.ai.counter('chat_stream_calls').add(1);
      this.ongoingStreamCount$.next(this.ongoingStreamCount$.value + 1);

      const source$ = from(prepared.stream).pipe(
        map(data => this.toMessageEvent(prepared.messageId, data)),
        catchError(e => {
          metrics.ai.counter('chat_stream_errors').add(1, { stage: 'stream' });
          return mapSseError(e, { endpoint: 'chat', stage: 'stream' });
        }),
        finalize(() => {
          this.ongoingStreamCount$.next(this.ongoingStreamCount$.value - 1);
        })
      );

      return this.mergePingStream(prepared.messageId || '', source$);
    } catch (err) {
      metrics.ai.counter('chat_stream_errors').add(1, { stage: 'prepare' });
      return mapSseError(err, { endpoint: 'chat', stage: 'prepare' });
    }
  }

  @Sse('/chat/:sessionId/stream-object')
  @CallMetric('ai', 'chat_object_stream', { timer: true })
  async chatStreamObject(
    @CurrentUser() user: CurrentUser,
    @Req() req: Request,
    @Param('sessionId') sessionId: string,
    @Query() query: Record<string, string>
  ): Promise<Observable<ChatEvent>> {
    try {
      const { signal, onConnectionClosed } = getSignal(req);
      let endBeforePromiseResolve = false;
      onConnectionClosed(isAborted => {
        if (isAborted) {
          endBeforePromiseResolve = true;
        }
      });

      const prepared = await this.orchestrator.streamObject(
        user.id,
        sessionId,
        query,
        signal,
        () => endBeforePromiseResolve
      );

      metrics.ai.counter('chat_object_stream_calls').add(1);
      this.ongoingStreamCount$.next(this.ongoingStreamCount$.value + 1);

      const source$ = from(prepared.stream).pipe(
        map(data => this.toMessageEvent(prepared.messageId, data)),
        catchError(e => {
          metrics.ai
            .counter('chat_object_stream_errors')
            .add(1, { stage: 'stream' });
          return mapSseError(e, {
            endpoint: 'chat_object',
            stage: 'stream',
          });
        }),
        finalize(() => {
          this.ongoingStreamCount$.next(this.ongoingStreamCount$.value - 1);
        })
      );

      return this.mergePingStream(prepared.messageId || '', source$);
    } catch (err) {
      metrics.ai
        .counter('chat_object_stream_errors')
        .add(1, { stage: 'prepare' });
      return mapSseError(err, {
        endpoint: 'chat_object',
        stage: 'prepare',
      });
    }
  }

  @Sse('/actions/:sessionId/stream')
  @CallMetric('ai', 'action_stream', { timer: true })
  async actionStream(
    @CurrentUser() user: CurrentUser,
    @Req() req: Request,
    @Param('sessionId') sessionId: string,
    @Query() query: Record<string, string>
  ): Promise<Observable<ChatEvent>> {
    try {
      const { signal } = getSignal(req);

      const prepared = await this.actionStreams.stream(
        user.id,
        sessionId,
        query,
        signal
      );
      metrics.ai.counter('action_stream_calls').add(1);
      this.ongoingStreamCount$.next(this.ongoingStreamCount$.value + 1);

      const source$ = from(prepared.stream).pipe(
        map(data => projectActionEventToChatEvent(prepared.messageId, data)),
        catchError(e => {
          metrics.ai
            .counter('action_stream_errors')
            .add(1, { stage: 'stream' });
          return mapSseError(e, { endpoint: 'action', stage: 'stream' });
        }),
        finalize(() =>
          this.ongoingStreamCount$.next(this.ongoingStreamCount$.value - 1)
        )
      );

      return this.mergePingStream(prepared.messageId || '', source$);
    } catch (err) {
      metrics.ai.counter('action_stream_errors').add(1, { stage: 'prepare' });
      return mapSseError(err, { endpoint: 'action', stage: 'prepare' });
    }
  }

  @Sse('/chat/:sessionId/images')
  @CallMetric('ai', 'chat_images', { timer: true })
  async chatImagesStream(
    @CurrentUser() user: CurrentUser,
    @Req() req: Request,
    @Param('sessionId') sessionId: string,
    @Query() query: Record<string, string>
  ): Promise<Observable<ChatEvent>> {
    try {
      const { signal, onConnectionClosed } = getSignal(req);
      let endBeforePromiseResolve = false;
      onConnectionClosed(isAborted => {
        if (isAborted) {
          endBeforePromiseResolve = true;
        }
      });

      const prepared = await this.orchestrator.streamImages(
        user.id,
        sessionId,
        query,
        signal,
        () => endBeforePromiseResolve
      );
      metrics.ai.counter('images_stream_calls').add(1);
      this.ongoingStreamCount$.next(this.ongoingStreamCount$.value + 1);

      const source$ = from(prepared.stream).pipe(
        map(attachment =>
          this.toAttachmentEvent(prepared.messageId, attachment)
        ),
        catchError(e => {
          metrics.ai
            .counter('images_stream_errors')
            .add(1, { stage: 'stream' });
          return mapSseError(e, { endpoint: 'images', stage: 'stream' });
        }),
        finalize(() =>
          this.ongoingStreamCount$.next(this.ongoingStreamCount$.value - 1)
        )
      );

      return this.mergePingStream(prepared.messageId || '', source$);
    } catch (err) {
      metrics.ai.counter('images_stream_errors').add(1, { stage: 'prepare' });
      return mapSseError(err, { endpoint: 'images', stage: 'prepare' });
    }
  }

  @Get('/unsplash/photos')
  @CallMetric('ai', 'unsplash')
  async unsplashPhotos(
    @Req() req: Request,
    @Res() res: Response,
    @Query() params: Record<string, string>
  ) {
    const { key } = this.config.copilot.unsplash;
    if (!key) {
      throw new UnsplashIsNotConfigured();
    }

    const query = new URLSearchParams(params);
    const start = performance.now();
    let response: globalThis.Response;
    try {
      response = await fetch(
        `https://api.unsplash.com/search/photos?${query}`,
        {
          headers: { Authorization: `Client-ID ${key}` },
          signal: getSignal(req).signal,
        }
      );
    } catch (error) {
      const durationMs = Math.round(performance.now() - start);
      this.logger.error(
        `Unsplash photo search network request failed after ${durationMs}ms: ${error instanceof Error ? error.message : String(error)}`
      );
      throw error;
    }

    const durationMs = Math.round(performance.now() - start);
    if (!response.ok) {
      this.logger.warn(
        `Unsplash API returned HTTP ${response.status} after ${durationMs}ms (Remaining rate limit: ${response.headers.get('X-Ratelimit-Remaining') ?? 'unknown'})`
      );
    }

    res.set({
      'Content-Type': response.headers.get('Content-Type'),
      'Content-Length': response.headers.get('Content-Length'),
      'X-Ratelimit-Limit': response.headers.get('X-Ratelimit-Limit'),
      'X-Ratelimit-Remaining': response.headers.get('X-Ratelimit-Remaining'),
    });

    res.status(response.status).send(await response.json());
  }
}
