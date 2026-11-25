import {
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

export interface UpdateSpendingLimitDto {
  monthlyLimit?: number;
  dailyLimit?: number;
  alertThresholdPercent?: number;
  hardLimitEnabled?: boolean;
}

export interface UpdatePolicyControlDto {
  allowedModels?: string[];
  allowedAgents?: string[];
  maxCreditPerRequest?: number;
  requireApprovalForAgents?: boolean;
}

@Injectable()
export class CommandCenterService {
  constructor(private readonly db: PrismaClient) {}

  /**
   * Aggregate usage overview by person, feature, and agent
   */
  async getUsageOverview(workspaceId?: string) {
    const transactions = await this.db.aiCreditTransaction.findMany({
      where: workspaceId ? { metadata: { path: ['workspaceId'], equals: workspaceId } } : {},
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const totalRequests = transactions.length;
    const totalCreditsSpent = transactions.reduce((acc, t) => acc + t.amount, 0);

    // Group by feature
    const byFeature: Record<string, { requests: number; credits: number }> = {};
    // Group by user
    const byUser: Record<string, { requests: number; credits: number }> = {};
    // Group by agent/model
    const byAgent: Record<string, { requests: number; credits: number }> = {};

    for (const t of transactions) {
      // Feature breakdown
      const feat = t.feature || 'chat';
      if (!byFeature[feat]) byFeature[feat] = { requests: 0, credits: 0 };
      byFeature[feat].requests += 1;
      byFeature[feat].credits += t.amount;

      // User breakdown
      const u = t.userId;
      if (!byUser[u]) byUser[u] = { requests: 0, credits: 0 };
      byUser[u].requests += 1;
      byUser[u].credits += t.amount;

      // Agent / Model breakdown
      const meta = typeof t.metadata === 'object' && t.metadata !== null ? (t.metadata as Record<string, any>) : {};
      const agentOrModel = meta.agentId || meta.model || meta.skill || 'general';
      if (!byAgent[agentOrModel]) byAgent[agentOrModel] = { requests: 0, credits: 0 };
      byAgent[agentOrModel].requests += 1;
      byAgent[agentOrModel].credits += t.amount;
    }

    return {
      totalRequests,
      totalCreditsSpent,
      byFeature: Object.entries(byFeature).map(([feature, data]) => ({ feature, ...data })),
      byUser: Object.entries(byUser).map(([userId, data]) => ({ userId, ...data })),
      byAgent: Object.entries(byAgent).map(([target, data]) => ({ target, ...data })),
    };
  }

  /**
   * Get or create spending limits and alert tracking for a user/workspace
   */
  async getSpendingLimit(userId: string, workspaceId?: string) {
    let limit = await this.db.aiSpendingLimit.findFirst({
      where: { userId, ...(workspaceId ? { workspaceId } : {}) },
    });

    if (!limit) {
      limit = await this.db.aiSpendingLimit.create({
        data: {
          userId,
          workspaceId,
          monthlyCreditLimit: 5000,
          dailyCreditLimit: 1000,
          alertThresholdPercent: 80,
          hardLimitEnabled: true,
        },
      });
    }

    const usagePercent = limit.monthlyCreditLimit > 0
      ? Math.round((limit.currentMonthUsage / limit.monthlyCreditLimit) * 100)
      : 0;

    return {
      ...limit,
      usagePercent,
      isAlertTriggered: limit.alertTriggered || usagePercent >= limit.alertThresholdPercent,
    };
  }

  /**
   * Update spending limits and alert configurations
   */
  async updateSpendingLimit(
    userId: string,
    workspaceId: string | undefined,
    dto: UpdateSpendingLimitDto
  ) {
    const existing = await this.getSpendingLimit(userId, workspaceId);

    return this.db.aiSpendingLimit.update({
      where: { id: existing.id },
      data: {
        ...(dto.monthlyLimit !== undefined ? { monthlyCreditLimit: dto.monthlyLimit } : {}),
        ...(dto.dailyLimit !== undefined ? { dailyCreditLimit: dto.dailyLimit } : {}),
        ...(dto.alertThresholdPercent !== undefined
          ? { alertThresholdPercent: dto.alertThresholdPercent }
          : {}),
        ...(dto.hardLimitEnabled !== undefined ? { hardLimitEnabled: dto.hardLimitEnabled } : {}),
      },
    });
  }

  /**
   * Check spending limit and record consumption with alert triggering
   */
  async assertAndRecordSpending(userId: string, workspaceId: string | undefined, credits: number) {
    const limit = await this.getSpendingLimit(userId, workspaceId);

    const newMonthUsage = limit.currentMonthUsage + credits;
    const newDayUsage = limit.currentDayUsage + credits;

    // Hard limit check
    if (limit.hardLimitEnabled && newMonthUsage > limit.monthlyCreditLimit) {
      throw new ForbiddenException({
        code: 'SPENDING_LIMIT_EXCEEDED',
        message: `Monthly AI spending limit exceeded (${newMonthUsage}/${limit.monthlyCreditLimit} credits). Increase limit in Admin Command Center.`,
      });
    }

    const thresholdCredits = (limit.monthlyCreditLimit * limit.alertThresholdPercent) / 100;
    const alertTriggered = newMonthUsage >= thresholdCredits;

    await this.db.aiSpendingLimit.update({
      where: { id: limit.id },
      data: {
        currentMonthUsage: newMonthUsage,
        currentDayUsage: newDayUsage,
        alertTriggered,
      },
    });

    return {
      monthlyUsage: newMonthUsage,
      dailyUsage: newDayUsage,
      alertTriggered,
    };
  }

  /**
   * Get team policy control for models and agents
   */
  async getWorkspacePolicy(workspaceId: string) {
    let policy = await this.db.aiPolicyControl.findUnique({
      where: { workspaceId },
    });

    if (!policy) {
      policy = await this.db.aiPolicyControl.create({
        data: {
          workspaceId,
          allowedModels: [
            'auto',
            'gpt-4o',
            'gpt-4o-mini',
            'claude-3-5-sonnet',
            'claude-3-5-haiku',
            'gemini-1.5-pro',
            'gemini-1.5-flash',
          ],
          allowedAgents: ['sys-researcher', 'sys-architect', 'sys-editor'],
          maxCreditPerRequest: 100,
          requireApprovalForAgents: false,
        },
      });
    }

    return policy;
  }

  /**
   * Update team policy controls
   */
  async updateWorkspacePolicy(workspaceId: string, dto: UpdatePolicyControlDto) {
    await this.getWorkspacePolicy(workspaceId);

    return this.db.aiPolicyControl.update({
      where: { workspaceId },
      data: {
        ...(dto.allowedModels ? { allowedModels: dto.allowedModels } : {}),
        ...(dto.allowedAgents ? { allowedAgents: dto.allowedAgents } : {}),
        ...(dto.maxCreditPerRequest !== undefined
          ? { maxCreditPerRequest: dto.maxCreditPerRequest }
          : {}),
        ...(dto.requireApprovalForAgents !== undefined
          ? { requireApprovalForAgents: dto.requireApprovalForAgents }
          : {}),
      },
    });
  }

  /**
   * Enforce model policy for team/workspace
   */
  async enforceModelPolicy(workspaceId: string, modelId: string) {
    if (!workspaceId || modelId === 'auto') return;

    const policy = await this.getWorkspacePolicy(workspaceId);
    const allowed = Array.isArray(policy.allowedModels)
      ? (policy.allowedModels as string[])
      : [];

    if (!allowed.includes(modelId) && !allowed.includes('*')) {
      throw new ForbiddenException(
        `AI Model '${modelId}' is disabled by your team workspace administrator policy.`
      );
    }
  }

  /**
   * Enforce agent policy for team/workspace
   */
  async enforceAgentPolicy(workspaceId: string, agentId: string) {
    if (!workspaceId) return;

    const policy = await this.getWorkspacePolicy(workspaceId);
    const allowed = Array.isArray(policy.allowedAgents)
      ? (policy.allowedAgents as string[])
      : [];

    if (!allowed.includes(agentId) && !allowed.includes('*')) {
      throw new ForbiddenException(
        `Agent '${agentId}' is restricted by team workspace policy.`
      );
    }
  }
}
