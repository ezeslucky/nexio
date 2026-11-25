import { Injectable } from '@nestjs/common';

export type ModelSpeed = 'fast' | 'medium' | 'slow';
export type ModelIntelligence = 'standard' | 'high' | 'smart';
export type ModelCostTier = '$' | '$$' | '$$$';

export interface AIModelMeta {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'nexio';
  speed: ModelSpeed;
  intelligence: ModelIntelligence;
  cost: ModelCostTier;
  contextWindow: number;
  creditMultiplier: number;
  description: string;
  isAutoRouter?: boolean;
}

export const DEFAULT_MODEL_REGISTRY: AIModelMeta[] = [
  {
    id: 'auto',
    name: 'Auto (Intelligent Router)',
    provider: 'nexio',
    speed: 'fast',
    intelligence: 'smart',
    cost: '$$',
    contextWindow: 128000,
    creditMultiplier: 1.0,
    description: 'Dynamic complexity routing with automatic retry fallback.',
    isAutoRouter: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    speed: 'fast',
    intelligence: 'smart',
    cost: '$$$',
    contextWindow: 128000,
    creditMultiplier: 5,
    description: 'Flagship omni model for complex reasoning, multi-step code, and analysis.',
  },
  {
    id: 'gpt-4o-mini',
    name: 'GPT-4o Mini',
    provider: 'openai',
    speed: 'fast',
    intelligence: 'standard',
    cost: '$',
    contextWindow: 128000,
    creditMultiplier: 1,
    description: 'Ultra-fast, cost-effective model for summaries, translations, and everyday tasks.',
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'anthropic',
    speed: 'medium',
    intelligence: 'smart',
    cost: '$$$',
    contextWindow: 200000,
    creditMultiplier: 5,
    description: 'State-of-the-art reasoning, deep coding, and nuanced writing.',
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    speed: 'fast',
    intelligence: 'standard',
    cost: '$',
    contextWindow: 200000,
    creditMultiplier: 1,
    description: 'Blazing fast model for quick edits and lightweight processing.',
  },
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'gemini',
    speed: 'medium',
    intelligence: 'high',
    cost: '$$',
    contextWindow: 1000000,
    creditMultiplier: 3,
    description: '1M token context window for large documents and multi-file analysis.',
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'gemini',
    speed: 'fast',
    intelligence: 'standard',
    cost: '$',
    contextWindow: 1000000,
    creditMultiplier: 1,
    description: 'High-speed, lightweight multimodal model.',
  },
];

@Injectable()
export class ModelRegistryService {
  private registry: Map<string, AIModelMeta> = new Map();

  constructor() {
    for (const m of DEFAULT_MODEL_REGISTRY) {
      this.registry.set(m.id, m);
    }
  }

  getModels(): AIModelMeta[] {
    return Array.from(this.registry.values());
  }

  getModel(id: string): AIModelMeta | undefined {
    return this.registry.get(id);
  }

  getDefaultModel(): AIModelMeta {
    return this.registry.get('auto') ?? DEFAULT_MODEL_REGISTRY[0];
  }
}

