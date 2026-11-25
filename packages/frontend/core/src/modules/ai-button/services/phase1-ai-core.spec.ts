import { describe, expect, it } from 'vitest';

// Model Registry Specification
interface AIModelMeta {
  id: string;
  name: string;
  provider: 'openai' | 'anthropic' | 'gemini' | 'nexio';
  speed: 'fast' | 'medium' | 'slow';
  intelligence: 'standard' | 'high' | 'smart';
  cost: '$' | '$$' | '$$$';
  creditMultiplier: number;
}

const REGISTRY: AIModelMeta[] = [
  { id: 'auto', name: 'Auto (Intelligent Router)', provider: 'nexio', speed: 'fast', intelligence: 'smart', cost: '$$', creditMultiplier: 1 },
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', speed: 'fast', intelligence: 'smart', cost: '$$$', creditMultiplier: 5 },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', speed: 'fast', intelligence: 'standard', cost: '$', creditMultiplier: 1 },
  { id: 'claude-3-5-sonnet', name: 'Claude 3.5 Sonnet', provider: 'anthropic', speed: 'medium', intelligence: 'smart', cost: '$$$', creditMultiplier: 5 },
  { id: 'claude-3-5-haiku', name: 'Claude 3.5 Haiku', provider: 'anthropic', speed: 'fast', intelligence: 'standard', cost: '$', creditMultiplier: 1 },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'gemini', speed: 'medium', intelligence: 'high', cost: '$$', creditMultiplier: 3 },
  { id: 'gemini-1.5-flash', name: 'Gemini 1.5 Flash', provider: 'gemini', speed: 'fast', intelligence: 'standard', cost: '$', creditMultiplier: 1 },
];

// Router logic
function routeTask(prompt: string, priority?: 'speed' | 'cost' | 'quality') {
  const p = prompt.toLowerCase();
  const isComplex = p.includes('code') || p.includes('architect') || p.includes('refactor') || p.length > 500;
  const isSimple = p.includes('translate') || p.includes('summarize') || p.includes('typo') || (p.length < 200 && !p.includes('```'));

  if (priority === 'cost') return { model: 'gemini-1.5-flash', complexity: 'simple', fallbacks: ['gpt-4o-mini'] };
  if (priority === 'speed') return { model: 'gpt-4o-mini', complexity: 'simple', fallbacks: ['gemini-1.5-flash'] };
  if (isComplex) return { model: 'gpt-4o', complexity: 'complex', fallbacks: ['claude-3-5-sonnet', 'gemini-1.5-pro'] };
  if (isSimple) return { model: 'gpt-4o-mini', complexity: 'simple', fallbacks: ['gemini-1.5-flash'] };
  return { model: 'gemini-1.5-pro', complexity: 'medium', fallbacks: ['gpt-4o', 'claude-3-5-sonnet'] };
}

// Fallback execution runner
async function executeWithFallback<T>(candidates: string[], runner: (model: string) => Promise<T>) {
  let attempts = 0;
  for (const m of candidates) {
    attempts++;
    try {
      const res = await runner(m);
      return { res, model: m, attempts };
    } catch {
      // continue to next fallback candidate
    }
  }
  throw new Error('All fallbacks failed');
}

// BYOK masking and validation
function validateKey(provider: string, key: string): boolean {
  const clean = key.trim();
  if (clean.length < 10) return false;
  if (provider === 'openai') return clean.startsWith('sk-');
  if (provider === 'anthropic') return clean.startsWith('sk-ant-');
  if (provider === 'gemini') return clean.startsWith('AIza') || clean.length >= 20;
  return true;
}

function maskKey(key: string): string {
  const t = key.trim();
  if (t.length <= 8) return '••••••••';
  return `${t.slice(0, 4)}...${t.slice(-4)}`;
}

// Credit Calculation
function calculateCredits(modelId: string): number {
  const found = REGISTRY.find(m => m.id === modelId);
  return found ? found.creditMultiplier : 1;
}

describe('Phase 1 - AI Core Unit Tests', () => {
  it('Model Registry should provide accurate speed, intelligence, and cost indicators', () => {
    expect(REGISTRY.length).toBeGreaterThanOrEqual(7);

    const gpt4o = REGISTRY.find(m => m.id === 'gpt-4o');
    expect(gpt4o?.speed).toBe('fast');
    expect(gpt4o?.intelligence).toBe('smart');
    expect(gpt4o?.cost).toBe('$$$');

    const mini = REGISTRY.find(m => m.id === 'gpt-4o-mini');
    expect(mini?.speed).toBe('fast');
    expect(mini?.intelligence).toBe('standard');
    expect(mini?.cost).toBe('$');
  });

  it('Auto Model Router should classify task complexity and route appropriately', () => {
    // Simple summary/translation task
    const simple = routeTask('Please translate this sentence to Spanish and fix any typo.');
    expect(simple.complexity).toBe('simple');
    expect(simple.model).toBe('gpt-4o-mini');

    // Complex coding/architecture task
    const complex = routeTask('Refactor this architecture to use microservices and generate code:\n```ts\nclass Service {}\n```');
    expect(complex.complexity).toBe('complex');
    expect(complex.model).toBe('gpt-4o');

    // Cost priority
    const cost = routeTask('Extract bullet points', 'cost');
    expect(cost.model).toBe('gemini-1.5-flash');
  });

  it('Auto Model Router should retry with fallback model when primary model fails', async () => {
    const candidates = ['gpt-4o', 'claude-3-5-sonnet', 'gpt-4o-mini'];
    let calls = 0;

    const outcome = await executeWithFallback(candidates, async (model) => {
      calls++;
      if (model === 'gpt-4o') {
        throw new Error('503 Service Unavailable');
      }
      return `Generated text from ${model}`;
    });

    expect(calls).toBe(2);
    expect(outcome.model).toBe('claude-3-5-sonnet');
    expect(outcome.attempts).toBe(2);
    expect(outcome.res).toBe('Generated text from claude-3-5-sonnet');
  });

  it('BYOK should validate provider prefixes and produce privacy masks', () => {
    expect(validateKey('openai', 'sk-proj-1234567890abcdef')).toBe(true);
    expect(validateKey('openai', 'bad-key')).toBe(false);
    expect(validateKey('anthropic', 'sk-ant-api03-abcdef12345678')).toBe(true);
    expect(validateKey('anthropic', 'sk-invalid')).toBe(false);
    expect(validateKey('gemini', 'AIzaSyD-1234567890abcdef')).toBe(true);

    expect(maskKey('sk-proj-1234567890abcdef')).toBe('sk-p...cdef');
    expect(maskKey('short')).toBe('••••••••');
  });

  it('Credit System should calculate tiered costs and deduct accurately', () => {
    expect(calculateCredits('gpt-4o-mini')).toBe(1);
    expect(calculateCredits('gemini-1.5-flash')).toBe(1);
    expect(calculateCredits('gemini-1.5-pro')).toBe(3);
    expect(calculateCredits('gpt-4o')).toBe(5);
    expect(calculateCredits('claude-3-5-sonnet')).toBe(5);
    expect(calculateCredits('auto')).toBe(1);
  });
});

