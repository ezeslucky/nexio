import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

export interface UserByokKeyInfo {
  provider: string;
  keyMask: string;
  isValid: boolean;
  lastUsedAt: Date | null;
  updatedAt: Date;
}

@Injectable()
export class ByokService {
  private readonly logger = new Logger(ByokService.name);
  private readonly secretKey: Buffer;

  constructor(private readonly db: PrismaClient) {
    const rawSecret =
      process.env.AI_BYOK_SECRET ||
      process.env.COOKIE_SECRET ||
      'nexio_default_secure_byok_encryption_secret_key_32b';
    this.secretKey = crypto.createHash('sha256').update(rawSecret).digest();
  }

  private encrypt(plaintext: string): {
    ciphertext: string;
    iv: string;
    tag: string;
  } {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', this.secretKey, iv);
    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = cipher.getAuthTag().toString('hex');
    return {
      ciphertext: encrypted,
      iv: iv.toString('hex'),
      tag,
    };
  }

  private decrypt(ciphertext: string, ivHex: string, tagHex: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      this.secretKey,
      Buffer.from(ivHex, 'hex')
    );
    decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
    let decrypted = decipher.update(ciphertext, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }

  createMask(key: string, _provider?: string): string {
    const trimmed = key.trim();
    if (trimmed.length <= 8) {
      return '••••••••';
    }
    const prefix = trimmed.slice(0, 4);
    const suffix = trimmed.slice(-4);
    return `${prefix}...${suffix}`;
  }

  validateKeyFormat(provider: string, key: string): boolean {
    const clean = key.trim();
    if (clean.length < 10) return false;
    switch (provider.toLowerCase()) {
      case 'openai':
        return clean.startsWith('sk-');
      case 'anthropic':
        return clean.startsWith('sk-ant-');
      case 'gemini':
        return clean.startsWith('AIza') || clean.length >= 20;
      default:
        return true;
    }
  }

  async saveKey(
    userId: string,
    provider: string,
    rawApiKey: string
  ): Promise<UserByokKeyInfo> {
    const normProvider = provider.toLowerCase().trim();
    if (!this.validateKeyFormat(normProvider, rawApiKey)) {
      throw new BadRequestException(
        `Invalid key format for provider ${provider}. Keys must adhere to official vendor prefix.`
      );
    }

    const { ciphertext, iv, tag } = this.encrypt(rawApiKey.trim());
    const mask = this.createMask(rawApiKey, normProvider);

    const record = await this.db.aiUserByokKey.upsert({
      where: {
        userId_provider: {
          userId,
          provider: normProvider,
        },
      },
      create: {
        userId,
        provider: normProvider,
        encryptedKey: ciphertext,
        iv,
        tag,
        keyMask: mask,
        isValid: true,
      },
      update: {
        encryptedKey: ciphertext,
        iv,
        tag,
        keyMask: mask,
        isValid: true,
        updatedAt: new Date(),
      },
    });

    return {
      provider: record.provider,
      keyMask: record.keyMask,
      isValid: record.isValid,
      lastUsedAt: record.lastUsedAt,
      updatedAt: record.updatedAt,
    };
  }

  async getUserKeys(userId: string): Promise<UserByokKeyInfo[]> {
    const records = await this.db.aiUserByokKey.findMany({
      where: { userId },
      orderBy: { provider: 'asc' },
    });
    return records.map(r => ({
      provider: r.provider,
      keyMask: r.keyMask,
      isValid: r.isValid,
      lastUsedAt: r.lastUsedAt,
      updatedAt: r.updatedAt,
    }));
  }

  async deleteKey(userId: string, provider: string): Promise<void> {
    await this.db.aiUserByokKey.deleteMany({
      where: {
        userId,
        provider: provider.toLowerCase().trim(),
      },
    });
  }

  async getDecryptedKey(
    userId: string,
    provider: string
  ): Promise<string | null> {
    const record = await this.db.aiUserByokKey.findUnique({
      where: {
        userId_provider: {
          userId,
          provider: provider.toLowerCase().trim(),
        },
      },
    });
    if (!record || !record.isValid) return null;

    try {
      const decrypted = this.decrypt(
        record.encryptedKey,
        record.iv,
        record.tag
      );
      await this.db.aiUserByokKey.update({
        where: { id: record.id },
        data: { lastUsedAt: new Date() },
      });
      return decrypted;
    } catch (err) {
      this.logger.error(
        `Failed to decrypt BYOK key for user ${userId}, provider ${provider}`
      );
      return null;
    }
  }
}
