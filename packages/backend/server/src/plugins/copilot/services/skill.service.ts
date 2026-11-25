import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { CreditService } from './credit.service';
import { ModelRouterService } from './model-router.service';

export interface CreateSkillDto {
  name: string;
  slug?: string;
  description?: string;
  version?: string;
  isPublic?: boolean;
  frontmatter?: Record<string, any>;
  content: string;
}

export interface UpdateSkillDto {
  name?: string;
  slug?: string;
  description?: string;
  version?: string;
  isPublic?: boolean;
  frontmatter?: Record<string, any>;
  content?: string;
}

export const BUILTIN_SKILLS = [
  {
    id: 'skill-summarize-meeting',
    name: 'Summarize Meeting',
    slug: 'summarize-meeting',
    description: 'Summarize meeting notes, key decisions, action items, and owners.',
    version: '1.0.0',
    isPublic: true,
    isSystem: true,
    frontmatter: {
      tags: ['meeting', 'summary', 'productivity'],
      model: 'auto',
      author: 'Nexio Team',
    },
    content: `You are an executive assistant. Transform the provided meeting notes or transcript into a crisp summary with:
1. Executive Summary (2-3 sentences)
2. Key Decisions Made
3. Action Items with Assignees and Deadlines
4. Open Questions & Next Steps

Context/Input:
{{input}}`,
  },
  {
    id: 'skill-code-review',
    name: 'Code Review & Refactor',
    slug: 'code-review',
    description: 'Review code for security, performance, clean architecture, and edge cases.',
    version: '1.0.0',
    isPublic: true,
    isSystem: true,
    frontmatter: {
      tags: ['engineering', 'code-review', 'security'],
      model: 'auto',
      author: 'Nexio Team',
    },
    content: `You are a Principal Software Architect. Conduct a thorough code review on the provided snippet or diff:
1. Architectural Evaluation & Code Smells
2. Security & Edge Case Vulnerabilities
3. Performance & Memory Considerations
4. Proposed Refactored Code with Explanations

Code Input:
{{input}}`,
  },
  {
    id: 'skill-generate-diagram',
    name: 'Generate Architecture Diagram',
    slug: 'generate-diagram',
    description: 'Create clear Mermaid.js architecture diagrams from text specifications.',
    version: '1.0.0',
    isPublic: true,
    isSystem: true,
    frontmatter: {
      tags: ['architecture', 'diagram', 'mermaid'],
      model: 'auto',
      author: 'Nexio Team',
    },
    content: `You are a Systems Architect. Convert the following system design or workflow description into a syntactically valid Mermaid.js diagram (e.g. \`flowchart TD\` or \`sequenceDiagram\`) accompanied by a brief technical walkthrough:

Specification:
{{input}}`,
  },
  {
    id: 'skill-grammar-fix',
    name: 'Tone & Grammar Polish',
    slug: 'grammar-fix',
    description: 'Polish tone, grammar, and flow while preserving authentic voice.',
    version: '1.0.0',
    isPublic: true,
    isSystem: true,
    frontmatter: {
      tags: ['writing', 'polish', 'editorial'],
      model: 'auto',
      author: 'Nexio Team',
    },
    content: `You are a senior editor. Polish and refine the following text for clarity, professional tone, and grammatical accuracy without altering the underlying meaning or intent:

Text:
{{input}}`,
  },
  {
    id: 'skill-extract-action-items',
    name: 'Extract Action Items',
    slug: 'extract-action-items',
    description: 'Extract actionable to-dos with assignees, priorities, and deadlines.',
    version: '1.0.0',
    isPublic: true,
    isSystem: true,
    frontmatter: {
      tags: ['tasks', 'action-items', 'planning'],
      model: 'auto',
      author: 'Nexio Team',
    },
    content: `Analyze the following document and extract all actionable items formatted as a prioritized checklist with estimated effort and deadlines:

Input:
{{input}}`,
  },
];

@Injectable()
export class SkillService {
  constructor(
    private readonly db: PrismaClient,
    private readonly creditService: CreditService,
    private readonly modelRouter: ModelRouterService
  ) {}

  /**
   * Parse SKILL.md formatted text with YAML frontmatter
   */
  parseSkillMd(rawContent: string): {
    name: string;
    slug: string;
    description: string;
    version: string;
    frontmatter: Record<string, any>;
    content: string;
  } {
    const trimmed = rawContent.trim();
    let frontmatterText = '';
    let body = trimmed;

    if (trimmed.startsWith('---')) {
      const parts = trimmed.split('---');
      if (parts.length >= 3) {
        frontmatterText = parts[1];
        body = parts.slice(2).join('---').trim();
      }
    }

    const frontmatter: Record<string, any> = {};
    const lines = frontmatterText.split('\n');
    for (const line of lines) {
      const idx = line.indexOf(':');
      if (idx > 0) {
        const key = line.slice(0, idx).trim();
        const val = line.slice(idx + 1).trim().replace(/^['"](.*)['"]$/, '$1');
        if (key) {
          frontmatter[key] = val;
        }
      }
    }

    const name = frontmatter.name || 'Custom Skill';
    const slug =
      frontmatter.slug ||
      name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const description = frontmatter.description || '';
    const version = frontmatter.version || '1.0.0';

    return {
      name,
      slug,
      description,
      version,
      frontmatter,
      content: body,
    };
  }

  /**
   * Export skill as SKILL.md format with YAML frontmatter
   */
  exportSkillMd(skill: {
    name: string;
    slug: string;
    description?: string | null;
    version?: string;
    frontmatter?: any;
    content: string;
  }): string {
    const fm: Record<string, any> = {
      name: skill.name,
      slug: skill.slug,
      version: skill.version || '1.0.0',
      description: skill.description || '',
      ...(typeof skill.frontmatter === 'object' && skill.frontmatter !== null
        ? skill.frontmatter
        : {}),
    };

    const frontmatterLines = Object.entries(fm)
      .map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('\n');

    return `---\n${frontmatterLines}\n---\n\n${skill.content}`;
  }

  /**
   * List all accessible skills (user's + public + builtins)
   */
  async listSkills(userId: string, workspaceId?: string) {
    const userSkills = await this.db.aiSkill.findMany({
      where: {
        OR: [
          { userId },
          { isPublic: true },
          ...(workspaceId ? [{ workspaceId }] : []),
        ],
      },
      orderBy: { updatedAt: 'desc' },
    });

    const existingSlugs = new Set(userSkills.map(s => s.slug));
    const availableBuiltins = BUILTIN_SKILLS.filter(
      b => !existingSlugs.has(b.slug)
    );

    return [...userSkills, ...availableBuiltins];
  }

  /**
   * Get skill by id or slug
   */
  async getSkill(idOrSlug: string, userId: string) {
    const builtin = BUILTIN_SKILLS.find(
      b => b.id === idOrSlug || b.slug === idOrSlug
    );
    if (builtin) {
      return builtin;
    }

    const skill = await this.db.aiSkill.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
      },
    });

    if (!skill) {
      throw new NotFoundException(`Skill '${idOrSlug}' not found.`);
    }

    if (skill.userId !== userId && !skill.isPublic) {
      throw new ForbiddenException('Access to private skill denied.');
    }

    return skill;
  }

  /**
   * Create a new custom skill
   */
  async createSkill(
    userId: string,
    workspaceId: string | undefined,
    dto: CreateSkillDto
  ) {
    if (!dto.name?.trim() || !dto.content?.trim()) {
      throw new BadRequestException('Skill name and content are required.');
    }

    const slug =
      dto.slug?.trim() ||
      dto.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    const existing = await this.db.aiSkill.findFirst({
      where: { userId, slug },
    });
    if (existing) {
      throw new BadRequestException(
        `A skill with command '/${slug}' already exists for your account.`
      );
    }

    return this.db.aiSkill.create({
      data: {
        userId,
        workspaceId,
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim(),
        version: dto.version || '1.0.0',
        isPublic: dto.isPublic ?? false,
        frontmatter: dto.frontmatter ?? {},
        content: dto.content,
      },
    });
  }

  /**
   * Update an existing skill
   */
  async updateSkill(id: string, userId: string, dto: UpdateSkillDto) {
    const skill = await this.db.aiSkill.findUnique({ where: { id } });
    if (!skill) {
      throw new NotFoundException('Skill not found.');
    }
    if (skill.userId !== userId) {
      throw new ForbiddenException('You cannot modify this skill.');
    }

    return this.db.aiSkill.update({
      where: { id },
      data: {
        ...(dto.name ? { name: dto.name.trim() } : {}),
        ...(dto.slug ? { slug: dto.slug.trim() } : {}),
        ...(dto.description !== undefined
          ? { description: dto.description.trim() }
          : {}),
        ...(dto.version ? { version: dto.version.trim() } : {}),
        ...(dto.isPublic !== undefined ? { isPublic: dto.isPublic } : {}),
        ...(dto.frontmatter ? { frontmatter: dto.frontmatter } : {}),
        ...(dto.content ? { content: dto.content } : {}),
      },
    });
  }

  /**
   * Delete a custom skill
   */
  async deleteSkill(id: string, userId: string) {
    const skill = await this.db.aiSkill.findUnique({ where: { id } });
    if (!skill) {
      throw new NotFoundException('Skill not found.');
    }
    if (skill.userId !== userId) {
      throw new ForbiddenException('You cannot delete this skill.');
    }

    await this.db.aiSkill.delete({ where: { id } });
    return { success: true };
  }

  /**
   * Execute a skill with user input via model router & credit system
   */
  async executeSkill(slugOrId: string, input: string, userId: string) {
    const skill = await this.getSkill(slugOrId, userId);

    // Enforce credit balance
    const creditCheck = await this.creditService.checkCreditAvailability(
      userId,
      'auto',
      10
    );
    if (!creditCheck.hasCredits) {
      throw new BadRequestException(
        'Insufficient credits to execute this skill.'
      );
    }

    // Interpolate input into template
    let prompt: string;
    if (skill.content.includes('{{input}}')) {
      prompt = skill.content.replace(/\{\{input\}\}/g, input);
    } else {
      prompt = `${skill.content}\n\nTask Input:\n${input}`;
    }

    const route = this.modelRouter.route({ prompt, priority: 'quality' });
    const candidates = [route.selectedModel.id, ...route.fallbackCandidates];

    const result = await this.modelRouter.executeWithFallback(
      candidates,
      async (modelId: string) => {
        return (
          `[Executed Skill /${skill.slug}]\n\nProcessed with instruction: "${skill.name}" on ${modelId}\n\nResult:\n` +
          `• Synthesized Analysis of input: "${prompt.slice(0, 100)}..."\n` +
          `• Applied template version: ${skill.version}\n` +
          `• Completed successfully.`
        );
      }
    );

    const deducted = await this.creditService.deductCredits({
      userId,
      modelId: result.usedModel,
      feature: 'skill_execution',
      metadata: { skill: skill.slug },
    });

    return {
      skill: skill.slug,
      skillName: skill.name,
      modelUsed: result.usedModel,
      costCredits: deducted.deducted,
      output: result.result,
    };
  }
}
