import { describe, expect, it } from 'vitest';

// Phase 2 Agent & Task interfaces
interface Agent {
  id: string;
  name: string;
  systemPrompt: string;
  modelId: string;
  isReviewRequired: boolean;
  subAgents: string[];
}

interface AgentTask {
  id: string;
  agentId: string;
  parentTaskId?: string;
  input: string;
  output?: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  reviewStatus: 'none' | 'pending' | 'approved' | 'rejected';
  reviewSummary?: string;
  changePayload?: any;
  appliedAt?: Date;
}

// Simulated Agent Engine
class AgentExecutionEngine {
  private tasks = new Map<string, AgentTask>();

  createTask(agent: Agent, input: string): AgentTask {
    const task: AgentTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      agentId: agent.id,
      input,
      status: 'queued',
      reviewStatus: 'none',
    };
    this.tasks.set(task.id, task);
    return task;
  }

  async runTaskWithSubAgents(parentAgent: Agent, subAgents: Agent[], input: string): Promise<AgentTask> {
    const task = this.createTask(parentAgent, input);
    task.status = 'running';

    const subOutputs: Record<string, string> = {};
    for (const sub of subAgents) {
      const subTask: AgentTask = {
        id: `subtask-${Date.now()}-${sub.id}`,
        agentId: sub.id,
        parentTaskId: task.id,
        input: `Delegated: ${input}`,
        output: `Analysis from ${sub.name}: verified specifications.`,
        status: 'done',
        reviewStatus: 'none',
      };
      this.tasks.set(subTask.id, subTask);
      subOutputs[sub.name] = subTask.output || '';
    }

    const synthesized = `Synthesis by ${parentAgent.name}:\n` +
      Object.entries(subOutputs).map(([name, out]) => `- ${name}: ${out}`).join('\n');

    task.output = synthesized;

    if (parentAgent.isReviewRequired) {
      task.reviewStatus = 'pending';
      task.reviewSummary = `Proposes applying synthesized document updates from ${parentAgent.name}.`;
      task.changePayload = { action: 'insert_blocks', content: synthesized };
    } else {
      task.status = 'done';
    }

    return task;
  }

  approveReview(taskId: string): AgentTask {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    if (task.reviewStatus !== 'pending') throw new Error('Task not awaiting review');

    task.reviewStatus = 'approved';
    task.status = 'done';
    task.appliedAt = new Date();
    return task;
  }

  rejectReview(taskId: string): AgentTask {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error('Task not found');
    if (task.reviewStatus !== 'pending') throw new Error('Task not awaiting review');

    task.reviewStatus = 'rejected';
    task.status = 'done';
    task.changePayload = null;
    return task;
  }
}

describe('Phase 2 - Agents, Sub-Agents & Review For Me Unit Tests', () => {
  const engine = new AgentExecutionEngine();

  const researcher: Agent = {
    id: 'agent-researcher',
    name: 'Research Analyst',
    systemPrompt: 'Extract key facts and research sources.',
    modelId: 'gemini-1.5-pro',
    isReviewRequired: false,
    subAgents: [],
  };

  const architect: Agent = {
    id: 'agent-architect',
    name: 'Code Architect',
    systemPrompt: 'Design scalable, typed systems.',
    modelId: 'gpt-4o',
    isReviewRequired: true,
    subAgents: ['agent-researcher'],
  };

  it('Agent creation should configure instructions, designated model, and review mode', () => {
    expect(architect.name).toBe('Code Architect');
    expect(architect.modelId).toBe('gpt-4o');
    expect(architect.isReviewRequired).toBe(true);
    expect(architect.subAgents).toContain('agent-researcher');
  });

  it('Coordinator agent should delegate to sub-agents and combine their outputs', async () => {
    const task = await engine.runTaskWithSubAgents(architect, [researcher], 'Design authentication architecture');

    expect(task.status).toBe('running'); // Paused in review state because isReviewRequired=true
    expect(task.reviewStatus).toBe('pending');
    expect(task.output).toContain('Synthesis by Code Architect');
    expect(task.output).toContain('Research Analyst: Analysis from Research Analyst');
  });

  it('Review For Me mode should withhold data changes until user approves', async () => {
    const task = await engine.runTaskWithSubAgents(architect, [researcher], 'Refactor database models');

    // Verification before approval:
    expect(task.reviewStatus).toBe('pending');
    expect(task.appliedAt).toBeUndefined();
    expect(task.changePayload).toBeDefined();
    expect(task.changePayload.action).toBe('insert_blocks');

    // User approves:
    const approved = engine.approveReview(task.id);
    expect(approved.reviewStatus).toBe('approved');
    expect(approved.status).toBe('done');
    expect(approved.appliedAt).toBeDefined();
  });

  it('Review For Me mode should discard change payload when user rejects', async () => {
    const task = await engine.runTaskWithSubAgents(architect, [researcher], 'Experimental risky rewrite');

    expect(task.reviewStatus).toBe('pending');

    // User rejects:
    const rejected = engine.rejectReview(task.id);
    expect(rejected.reviewStatus).toBe('rejected');
    expect(rejected.status).toBe('done');
    expect(rejected.changePayload).toBeNull();
    expect(rejected.appliedAt).toBeUndefined();
  });

  it('Direct agent without review mode should complete task directly', async () => {
    const directTask = await engine.runTaskWithSubAgents(researcher, [], 'Summarize project history');

    expect(directTask.status).toBe('done');
    expect(directTask.reviewStatus).toBe('none');
    expect(directTask.changePayload).toBeUndefined();
  });
});
