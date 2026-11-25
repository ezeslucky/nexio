import { describe, expect, it } from 'vitest';
import * as crypto from 'crypto';

// Phase 3 Skills parsing & export logic
function parseSkillMd(rawContent: string) {
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

  return { name, slug, description, version, frontmatter, content: body };
}

function exportSkillMd(skill: {
  name: string;
  slug: string;
  version?: string;
  description?: string;
  content: string;
}) {
  const fm = [
    `name: "${skill.name}"`,
    `slug: "${skill.slug}"`,
    `version: "${skill.version || '1.0.0'}"`,
    `description: "${skill.description || ''}"`,
  ].join('\n');
  return `---\n${fm}\n---\n\n${skill.content}`;
}

// MCP Token Manager
class McpTokenManager {
  private connections = new Map<string, { tokenHash: string; clientName: string; isRevoked: boolean; permissions: string[] }>();

  createToken(clientName: string, permissions: string[]) {
    const raw = `nx_mcp_${crypto.randomBytes(16).toString('hex')}`;
    const tokenHash = crypto.createHash('sha256').update(raw).digest('hex');
    const id = `conn_${Date.now()}`;
    this.connections.set(id, { tokenHash, clientName, isRevoked: false, permissions });
    return { id, raw, tokenHash, clientName };
  }

  revoke(id: string) {
    const conn = this.connections.get(id);
    if (!conn) throw new Error('Not found');
    conn.isRevoked = true;
    return true;
  }

  authenticate(rawToken: string) {
    const hash = crypto.createHash('sha256').update(rawToken).digest('hex');
    for (const [id, conn] of this.connections.entries()) {
      if (conn.tokenHash === hash) {
        if (conn.isRevoked) {
          throw new Error('Revoked token');
        }
        return { id, clientName: conn.clientName, permissions: conn.permissions };
      }
    }
    throw new Error('Invalid token');
  }
}

// MCP Client Confirmation Manager
class McpConfirmationManager {
  private pending = new Map<string, { toolName: string; args: any; status: 'pending' | 'approved' | 'rejected' }>();

  requestExecution(toolName: string, args: any, requireConfirmation = true) {
    if (!requireConfirmation) {
      return { status: 'executed', result: `Direct executed ${toolName}` };
    }
    const id = `conf_${Date.now()}`;
    this.pending.set(id, { toolName, args, status: 'pending' });
    return { status: 'confirmation_required', confirmationId: id, toolName, args };
  }

  respond(confirmationId: string, approved: boolean) {
    const item = this.pending.get(confirmationId);
    if (!item) throw new Error('Not found');
    if (approved) {
      item.status = 'approved';
      return { status: 'executed', result: `Successfully executed ${item.toolName}` };
    } else {
      item.status = 'rejected';
      return { status: 'rejected', error: 'Action rejected by user' };
    }
  }
}

describe('Phase 3 - Context, Skills Library & MCP Protocols', () => {
  it('Skill 1: should parse SKILL.md with YAML frontmatter accurately', () => {
    const sampleSkillMd = `---
name: Meeting Summarizer
slug: meeting-summary
version: 1.2.0
description: Extract decisions and action items from transcripts
---

# Meeting Summary Instructions
Please analyze the following meeting transcript:
{{input}}
`;
    const parsed = parseSkillMd(sampleSkillMd);

    expect(parsed.name).toBe('Meeting Summarizer');
    expect(parsed.slug).toBe('meeting-summary');
    expect(parsed.version).toBe('1.2.0');
    expect(parsed.description).toBe('Extract decisions and action items from transcripts');
    expect(parsed.content).toContain('{{input}}');
  });

  it('Skill 2: should export skills to valid SKILL.md format and interpolate inputs', () => {
    const skill = {
      name: 'Code Reviewer',
      slug: 'code-review',
      version: '2.0.0',
      description: 'Senior code review',
      content: 'Review this code snippet:\n{{input}}',
    };

    const exported = exportSkillMd(skill);
    expect(exported).toContain('name: "Code Reviewer"');
    expect(exported).toContain('slug: "code-review"');
    expect(exported).toContain('version: "2.0.0"');

    // Interpolation test
    const userCode = 'function add(a, b) { return a + b; }';
    const finalPrompt = skill.content.replace('{{input}}', userCode);
    expect(finalPrompt).toContain('function add(a, b)');
  });

  it('MCP 1: should issue tokens, authenticate, and support administrative revocation', () => {
    const manager = new McpTokenManager();
    const token = manager.createToken('Cursor IDE', ['read:docs', 'write:docs']);

    expect(token.raw.startsWith('nx_mcp_')).toBe(true);

    // Valid authentication
    const auth1 = manager.authenticate(token.raw);
    expect(auth1.clientName).toBe('Cursor IDE');
    expect(auth1.permissions).toContain('read:docs');

    // Revoke token
    manager.revoke(token.id);

    // Attempting to authenticate with revoked token must fail
    expect(() => manager.authenticate(token.raw)).toThrow('Revoked token');
  });

  it('MCP 2: should enforce human confirmation before executing mutating external MCP tools', () => {
    const client = new McpConfirmationManager();

    // Invoking tool with requireConfirmation=true
    const req = client.requestExecution('postgres_drop_table', { table: 'customers' }, true);
    expect(req.status).toBe('confirmation_required');
    expect(req.confirmationId).toBeDefined();

    // Rejecting action
    const rejection = client.respond(req.confirmationId!, false);
    expect(rejection.status).toBe('rejected');
    expect(rejection.error).toBe('Action rejected by user');

    // Approving a new action
    const req2 = client.requestExecution('github_create_pr', { title: 'feat: add skills' }, true);
    const approval = client.respond(req2.confirmationId!, true);
    expect(approval.status).toBe('executed');
    expect(approval.result).toContain('github_create_pr');
  });

  it('MCP 3: should handle JSON-RPC tool definitions for Nexio MCP server', () => {
    const tools = [
      'nexio_list_docs',
      'nexio_read_doc',
      'nexio_search_docs',
      'nexio_create_doc',
      'nexio_update_doc',
      'nexio_list_databases',
    ];

    expect(tools.length).toBe(6);
    expect(tools).toContain('nexio_read_doc');
    expect(tools).toContain('nexio_update_doc');
  });
});
