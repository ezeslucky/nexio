import { Injectable, Logger } from '@nestjs/common';
import { ModelRegistryService, type AIModelMeta } from './model-registry.service';

export interface RouteTaskContext {
  prompt?: string;
  messages?: Array<{ role: string; content: string }>;
  toolsRequired?: boolean;
  priority?: 'speed' | 'quality' | 'cost';
}

export interface RoutingDecision {
  selectedModel: AIModelMeta;
  taskComplexity: 'simple' | 'medium' | 'complex';
  reasoning: string;
  fallbackCandidates: string[];
}

@Injectable()
export class ModelRouterService {
  private readonly logger = new Logger(ModelRouterService.name);

  constructor(private readonly registry: ModelRegistryService) {}

  classifyTask(context: RouteTaskContext): 'simple' | 'medium' | 'complex' {
    const fullText = (
      (context.prompt || '') +
      ' ' +
      (context.messages || []).map(m => m.content).join(' ')
    ).toLowerCase();

    // Complex signals
    const complexKeywords = [
      'architect',
      'refactor',
      'algorithm',
      'optimize',
      'debug',
      'multi-step',
      'system design',
      'security vulnerability',
      'database schema',
      'regex',
      'ast',
      'proof',
    ];
    const hasCodeBlock =
      fullText.includes('```') ||
      fullText.includes('function') ||
      fullText.includes('class ');
    const isLong = fullText.length > 700;

    let score = 0;
    for (const kw of complexKeywords) {
      if (fullText.includes(kw)) score += 2;
    }
    if (hasCodeBlock) score += 2;
    if (isLong) score += 1;
    if (context.toolsRequired) score += 2;

    if (score >= 3) return 'complex';

    // Simple signals
    const simpleKeywords = [
      'translate',
      'spelling',
      'grammar',
      'summarize',
      'tldr',
      'bullet points',
      'headline',
      'shorten',
      'expand',
      'fix typo',
    ];
    let simpleScore = 0;
    for (const kw of simpleKeywords) {
      if (fullText.includes(kw)) simpleScore += 2;
    }
    if (fullText.length < 200 && !hasCodeBlock) simpleScore += 2;

    if (simpleScore >= 2 && score === 0) return 'simple';

    return 'medium';
  }

  route(context: RouteTaskContext, requestedModelId?: string): RoutingDecision {
    if (requestedModelId && requestedModelId !== 'auto') {
      const explicitModel = this.registry.getModel(requestedModelId);
      if (explicitModel) {
        return {
          selectedModel: explicitModel,
          taskComplexity: 'medium',
          reasoning: `User explicitly selected ${explicitModel.name}.`,
          fallbackCandidates: this.getFallbacksFor(explicitModel.id),
        };
      }
    }

    const complexity = this.classifyTask(context);
    let selectedId: string;
    let reasoning: string;

    if (context.priority === 'speed') {
      selectedId = 'gpt-4o-mini';
      reasoning = 'Prioritizing fastest response time.';
    } else if (context.priority === 'cost') {
      selectedId = 'gemini-1.5-flash';
      reasoning = 'Prioritizing lowest credit consumption.';
    } else if (complexity === 'complex') {
      selectedId = 'gpt-4o';
      reasoning = 'Task detected as complex reasoning or code; routed to flagship model.';
    } else if (complexity === 'simple') {
      selectedId = 'gpt-4o-mini';
      reasoning = 'Task detected as standard text/summary; routed to efficient model.';
    } else {
      selectedId = 'gemini-1.5-pro';
      reasoning = 'Balanced general inquiry; routed to high-capacity model.';
    }

    const selectedModel =
      this.registry.getModel(selectedId) || this.registry.getDefaultModel();
    return {
      selectedModel,
      taskComplexity: complexity,
      reasoning,
      fallbackCandidates: this.getFallbacksFor(selectedModel.id),
    };
  }

  getFallbacksFor(modelId: string): string[] {
    const fallbackMap: Record<string, string[]> = {
      'gpt-4o': ['claude-3-5-sonnet', 'gemini-1.5-pro', 'gpt-4o-mini'],
      'claude-3-5-sonnet': ['gpt-4o', 'gemini-1.5-pro', 'gpt-4o-mini'],
      'gpt-4o-mini': ['gemini-1.5-flash', 'claude-3-5-haiku', 'gpt-4o'],
      'claude-3-5-haiku': ['gpt-4o-mini', 'gemini-1.5-flash'],
      'gemini-1.5-pro': ['gpt-4o', 'claude-3-5-sonnet'],
      'gemini-1.5-flash': ['gpt-4o-mini', 'claude-3-5-haiku'],
    };
    return fallbackMap[modelId] || ['gpt-4o-mini'];
  }

  async executeWithFallback<T>(
    candidates: string[],
    runner: (modelId: string) => Promise<T>
  ): Promise<{ result: T; usedModel: string; attempts: number }> {
    let lastError: any = null;
    let attempts = 0;

    for (const modelId of candidates) {
      attempts++;
      try {
        this.logger.log(
          `Attempting LLM execution with model: ${modelId} (attempt ${attempts})`
        );
        const result = await runner(modelId);
        return { result, usedModel: modelId, attempts };
      } catch (err: any) {
        lastError = err;
        this.logger.warn(
          `Model ${modelId} failed: ${err?.message || err}. Retrying with next fallback candidate...`
        );
      }
    }

    throw new Error(
      `All model attempts failed (${candidates.join(', ')}). Last error: ${lastError?.message || lastError}`
    );
  }
}

