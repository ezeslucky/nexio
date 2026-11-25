import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ModelRegistryService } from './model-registry.service';

export interface DeductCreditOptions {
  userId: string;
  modelId?: string;
  feature: string;
  agentId?: string;
  customCredits?: number;
  metadata?: Record<string, any>;
}

@Injectable()
export class CreditService {
  private readonly logger = new Logger(CreditService.name);

  constructor(
    private readonly db: PrismaClient,
    private readonly modelRegistry: ModelRegistryService
  ) {}

  async getOrCreateAccount(userId: string) {
    let account = await this.db.aiUserCreditAccount.findUnique({
      where: { userId },
    });
    if (!account) {
      account = await this.db.aiUserCreditAccount.create({
        data: {
          userId,
          balance: 1000, // Initial free allocation
          lifetimeUsed: 0,
        },
      });
    }
    return account;
  }

  calculateRequiredCredits(modelId?: string, customCredits?: number): number {
    if (typeof customCredits === 'number' && customCredits > 0) {
      return customCredits;
    }
    if (!modelId || modelId === 'auto') return 1;
    const model = this.modelRegistry.getModel(modelId);
    return model?.creditMultiplier ?? 1;
  }

  async checkCreditAvailability(
    userId: string,
    modelId?: string,
    customCredits?: number
  ) {
    const account = await this.getOrCreateAccount(userId);
    const required = this.calculateRequiredCredits(modelId, customCredits);
    const hasCredits = account.balance >= required;
    return {
      hasCredits,
      balance: account.balance,
      required,
      lifetimeUsed: account.lifetimeUsed,
    };
  }

  async deductCredits(opts: DeductCreditOptions) {
    const required = this.calculateRequiredCredits(
      opts.modelId,
      opts.customCredits
    );
    const account = await this.getOrCreateAccount(opts.userId);

    if (account.balance < required) {
      throw new ForbiddenException({
        code: 'INSUFFICIENT_AI_CREDITS',
        message: `Insufficient AI credits. You have ${account.balance} credits, but this request requires ${required} credits. Upgrade or bring your own API key (BYOK).`,
        balance: account.balance,
        required,
      });
    }

    const newBalance = account.balance - required;

    const [updatedAccount, transaction] = await this.db.$transaction([
      this.db.aiUserCreditAccount.update({
        where: { id: account.id },
        data: {
          balance: newBalance,
          lifetimeUsed: { increment: required },
        },
      }),
      this.db.aiCreditTransaction.create({
        data: {
          accountId: account.id,
          userId: opts.userId,
          amount: -required,
          balanceAfter: newBalance,
          feature: opts.feature,
          model: opts.modelId,
          agentId: opts.agentId,
          metadata: opts.metadata ?? {},
        },
      }),
    ]);

    this.logger.log(
      `Deducted ${required} credits from user ${opts.userId}. Balance: ${newBalance}`
    );
    return {
      balance: updatedAccount.balance,
      deducted: required,
      transactionId: transaction.id,
    };
  }

  async addCredits(userId: string, amount: number, reason: string) {
    const account = await this.getOrCreateAccount(userId);
    const newBalance = account.balance + amount;

    return await this.db.$transaction([
      this.db.aiUserCreditAccount.update({
        where: { id: account.id },
        data: { balance: newBalance },
      }),
      this.db.aiCreditTransaction.create({
        data: {
          accountId: account.id,
          userId,
          amount,
          balanceAfter: newBalance,
          feature: 'refill',
          metadata: { reason },
        },
      }),
    ]);
  }

  async getRecentTransactions(userId: string, limit = 20) {
    return await this.db.aiCreditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

