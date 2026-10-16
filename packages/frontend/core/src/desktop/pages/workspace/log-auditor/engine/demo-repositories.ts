import type { RepositoryFile } from '../types';

export interface DemoRepositoryDef {
  id: string;
  name: string;
  description: string;
  primaryLanguage: string;
  frameworks: string[];
  files: RepositoryFile[];
}

export const DEMO_REPOSITORIES: DemoRepositoryDef[] = [
  {
    id: 'fintech-payment-service',
    name: 'Fintech Payments & Billing Gateway',
    description: 'Production Node.js/Express service handling Stripe charges, subscription upgrades, and webhook events with several critical logging gaps.',
    primaryLanguage: 'TypeScript',
    frameworks: ['Express', 'Pino', 'Prisma', 'Stripe'],
    files: [
      {
        id: 'file-1',
        name: 'payment.controller.ts',
        path: 'src/controllers/payment.controller.ts',
        language: 'typescript',
        lineCount: 88,
        sizeBytes: 3120,
        gapsCount: 0,
        content: `import { Request, Response } from 'express';
import { paymentService } from '../services/payment.service';
import { logger } from '../utils/logger';

export class PaymentController {
  async processCharge(req: Request, res: Response) {
    const { customerId, amount, currency, paymentMethodId } = req.body;

    try {
      logger.info({ customerId, amount, currency }, 'Initiating payment charge');
      const result = await paymentService.chargeCustomer({
        customerId,
        amount,
        currency,
        paymentMethodId,
      });

      return res.status(200).json({ success: true, chargeId: result.id });
    } catch (err: any) {
      // Swallowed error: returns 500 without capturing error details or stack trace
      return res.status(500).json({ error: 'Payment charge failed' });
    }
  }

  async handleWebhook(req: Request, res: Response) {
    const event = req.body;

    // Critical external webhook event received without signature verification or arrival log
    if (event.type === 'invoice.payment_succeeded') {
      const invoice = event.data.object;
      await paymentService.renewSubscription(invoice.subscription, invoice.customer);
    } else if (event.type === 'invoice.payment_failed') {
      const invoice = event.data.object;
      await paymentService.suspendAccount(invoice.customer);
    }

    return res.status(200).json({ received: true });
  }

  async refundCustomer(req: Request, res: Response) {
    const { chargeId, reason, amount } = req.body;
    try {
      const refund = await paymentService.createRefund(chargeId, amount, reason);
      return res.status(200).json(refund);
    } catch (error) {
      // Catch without recording customer or charge ID
      logger.error('Failed to refund');
      return res.status(400).json({ error: 'Refund denied' });
    }
  }
}
`,
      },
      {
        id: 'file-2',
        name: 'payment.service.ts',
        path: 'src/services/payment.service.ts',
        language: 'typescript',
        lineCount: 110,
        sizeBytes: 4200,
        gapsCount: 0,
        content: `import { prisma } from '../db/client';
import { stripeClient } from '../clients/stripe';
import { logger } from '../utils/logger';

export class PaymentService {
  async chargeCustomer(params: {
    customerId: string;
    amount: number;
    currency: string;
    paymentMethodId: string;
  }) {
    // Unobserved external Stripe API call without latency or error status capture
    const paymentIntent = await stripeClient.paymentIntents.create({
      customer: params.customerId,
      amount: params.amount,
      currency: params.currency,
      payment_method: params.paymentMethodId,
      confirm: true,
      off_session: true,
    });

    // Database transaction without failure or rollback logging
    const transactionRecord = await prisma.transaction.create({
      data: {
        customerId: params.customerId,
        stripePaymentId: paymentIntent.id,
        amount: params.amount,
        status: paymentIntent.status === 'succeeded' ? 'SUCCESS' : 'PENDING',
        createdAt: new Date(),
      },
    });

    return transactionRecord;
  }

  async renewSubscription(subscriptionId: string, customerId: string) {
    // High-value state transition without audit log
    await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'ACTIVE',
        lastRenewedAt: new Date(),
        renewalCount: { increment: 1 },
      },
    });

    await prisma.user.update({
      where: { id: customerId },
      data: { tier: 'PRO_ENTERPRISE' },
    });
  }

  async suspendAccount(customerId: string) {
    // Account suspension without audit or reason logging
    await prisma.user.update({
      where: { id: customerId },
      data: { isSuspended: true, suspendedAt: new Date() },
    });
  }

  async createRefund(chargeId: string, amount: number, reason: string) {
    const refund = await stripeClient.refunds.create({
      charge: chargeId,
      amount,
      reason: reason as any,
    });
    return refund;
  }
}

export const paymentService = new PaymentService();
`,
      },
      {
        id: 'file-3',
        name: 'auth.middleware.ts',
        path: 'src/middleware/auth.middleware.ts',
        language: 'typescript',
        lineCount: 45,
        sizeBytes: 1540,
        gapsCount: 0,
        content: `import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export function authenticateJWT(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    // Rejection without recording client IP, user agent, or requested route
    return res.status(401).json({ message: 'Authentication required' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
    (req as any).user = decoded;
    next();
  } catch (err) {
    // Empty catch block: Token verification failure swallowed without diagnosis
    return res.status(403).json({ message: 'Invalid or expired token' });
  }
}
`,
      },
    ],
  },
  {
    id: 'healthcare-telemetry-api',
    name: 'Healthcare Patient Telemetry API',
    description: 'Python / FastAPI service collecting vital sensor streaming data, processing alerts, and communicating with hospital EHR systems.',
    primaryLanguage: 'Python',
    frameworks: ['FastAPI', 'SQLAlchemy', 'Python-Logging'],
    files: [
      {
        id: 'py-file-1',
        name: 'vitals_router.py',
        path: 'app/routers/vitals_router.py',
        language: 'python',
        lineCount: 75,
        sizeBytes: 2890,
        gapsCount: 0,
        content: `from fastapi import APIRouter, HTTPException, Depends
import logging
from app.services.vitals_service import VitalsService

router = APIRouter(prefix="/vitals", tags=["telemetry"])
logger = logging.getLogger("telemetry")

@router.post("/record")
async def record_vitals(payload: dict):
    patient_id = payload.get("patient_id")
    heart_rate = payload.get("heart_rate")
    oxygen_level = payload.get("spO2")

    try:
        service = VitalsService()
        result = await service.save_telemetry(patient_id, heart_rate, oxygen_level)
        return {"status": "recorded", "id": result.id}
    except Exception as e:
        # Swallowed error in medical telemetry
        raise HTTPException(status_code=500, detail="Telemetry recording failed")

@router.post("/alert")
async def trigger_emergency_alert(patient_id: str, severity: str):
    # Critical patient emergency dispatch with zero logging context
    service = VitalsService()
    await service.notify_on_call_physician(patient_id, severity)
    return {"status": "alert_dispatched"}
`,
      },
      {
        id: 'py-file-2',
        name: 'vitals_service.py',
        path: 'app/services/vitals_service.py',
        language: 'python',
        lineCount: 92,
        sizeBytes: 3400,
        gapsCount: 0,
        content: `import httpx
from app.db.session import async_session
from app.models.vital_record import VitalRecord

class VitalsService:
    async def save_telemetry(self, patient_id: str, hr: int, spo2: int):
        # Database commit without failure logging
        async with async_session() as session:
            record = VitalRecord(patient_id=patient_id, heart_rate=hr, spo2=spo2)
            session.add(record)
            await session.commit()
            await session.refresh(record)
            return record

    async def notify_on_call_physician(self, patient_id: str, alert_level: str):
        # External pager API call without timeout, latency, or status code logging
        async with httpx.AsyncClient() as client:
            resp = await client.post(
                "https://pager.hospital-net.internal/api/v1/dispatch",
                json={"patientId": patient_id, "priority": alert_level},
                timeout=5.0
            )
            return resp.status_code == 200
`,
      },
    ],
  },
  {
    id: 'nexio-server-sample',
    name: 'Nexio Cloud Backend Services',
    description: 'Production TypeScript services powering Nexio workspace collaboration, AI copilot sessions, and storage sync.',
    primaryLanguage: 'TypeScript',
    frameworks: ['NestJS', 'Prisma', 'Pino'],
    files: [
      {
        id: 'nexio-1',
        name: 'copilot.service.ts',
        path: 'packages/backend/server/src/core/copilot/copilot.service.ts',
        language: 'typescript',
        lineCount: 65,
        sizeBytes: 2400,
        gapsCount: 0,
        content: `import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CopilotService {
  private readonly logger = new Logger(CopilotService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createSession(userId: string, workspaceId: string, model: string) {
    try {
      return await this.prisma.copilotSession.create({
        data: { userId, workspaceId, model, status: 'INITIALIZED' }
      });
    } catch (e) {
      // Swallowed error: session creation error returned as null without log
      return null;
    }
  }

  async streamPrompt(sessionId: string, prompt: string) {
    // Multi-step upstream AI API dispatch without latency or token count logging
    const upstreamUrl = process.env.UPSTREAM_AI_URL || 'https://api.openai.com/v1/chat/completions';
    const response = await fetch(upstreamUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, stream: true }),
    });

    if (!response.ok) {
      throw new Error('Upstream provider returned non-200');
    }
    return response.body;
  }
}
`,
      },
    ],
  },
];
