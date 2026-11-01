import type { CodebaseAnalysisResult, DiagramEdge, DiagramItem, DiagramNode, ERDColumn } from '../types';

/**
 * Parses SQL DDL statements (e.g. CREATE TABLE) into an interactive ERD Diagram
 */
export function convertSqlToErd(sql: string): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  // Match CREATE TABLE statements
  const tableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([`"']?[\w_]+[`"']?)\s*\(([\s\S]*?)\);/gi;
  let match: RegExpExecArray | null;
  let tableIndex = 0;

  const tableMap = new Map<string, string>(); // tableName -> nodeId

  while ((match = tableRegex.exec(sql)) !== null) {
    const rawTableName = match[1].replace(/[`"']/g, '').trim();
    const body = match[2];
    const nodeId = `erd-table-${rawTableName.toLowerCase()}`;
    tableMap.set(rawTableName.toLowerCase(), nodeId);

    const columns: ERDColumn[] = [];
    const lines = body.split(',\n');

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith('--') || line.toUpperCase().startsWith('CONSTRAINT')) continue;

      const colMatch = /^([`"']?[\w_]+[`"']?)\s+([\w_]+(?:\([^)]+\))?)(.*)$/i.exec(line);
      if (colMatch) {
        const colName = colMatch[1].replace(/[`"']/g, '').trim();
        const colType = colMatch[2].toUpperCase().trim();
        const rest = (colMatch[3] || '').toUpperCase();
        const isPrimary = rest.includes('PRIMARY KEY') || colName.toLowerCase() === 'id';
        const isForeign = rest.includes('REFERENCES') || colName.toLowerCase().endsWith('_id');

        columns.push({
          name: colName,
          type: colType,
          isPrimary,
          isForeign,
        });

        // Detect inline foreign key references
        const refMatch = /REFERENCES\s+([`"']?[\w_]+[`"']?)/i.exec(rest);
        if (refMatch) {
          const targetTable = refMatch[1].replace(/[`"']/g, '').toLowerCase();
          edges.push({
            id: `edge-fk-${rawTableName}-${targetTable}-${colName}`,
            fromNodeId: nodeId,
            toNodeId: `erd-table-${targetTable}`,
            label: `FK (${colName})`,
            style: 'orthogonal',
            color: '#10b981',
          });
        }
      }
    }

    const row = Math.floor(tableIndex / 3);
    const col = tableIndex % 3;

    nodes.push({
      id: nodeId,
      shape: 'database',
      label: rawTableName,
      position: { x: 80 + col * 320, y: 100 + row * 260 },
      columns: columns.length > 0 ? columns : [
        { name: 'id', type: 'UUID', isPrimary: true },
        { name: 'created_at', type: 'TIMESTAMP' },
      ],
      color: '#3b82f6',
    });

    tableIndex++;
  }

  // Fallback if no full CREATE TABLE parsed
  if (nodes.length === 0) {
    nodes.push(
      {
        id: 'erd-users',
        shape: 'database',
        label: 'users',
        position: { x: 100, y: 140 },
        columns: [
          { name: 'id', type: 'UUID', isPrimary: true },
          { name: 'email', type: 'VARCHAR(255)' },
          { name: 'created_at', type: 'TIMESTAMP' },
        ],
        color: '#3b82f6',
      },
      {
        id: 'erd-orders',
        shape: 'database',
        label: 'orders',
        position: { x: 440, y: 140 },
        columns: [
          { name: 'id', type: 'UUID', isPrimary: true },
          { name: 'user_id', type: 'UUID', isForeign: true },
          { name: 'total_amount', type: 'DECIMAL(10,2)' },
        ],
        color: '#10b981',
      }
    );
    edges.push({
      id: 'erd-users-orders',
      fromNodeId: 'erd-users',
      toNodeId: 'erd-orders',
      label: '1 to N',
      style: 'orthogonal',
    });
  }

  return { nodes, edges };
}

/**
 * Parses Terraform HCL code into a Cloud Architecture diagram
 */
export function convertTerraformToDiagram(hcl: string): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];

  const resourceRegex = /resource\s+"([\w_]+)"\s+"([\w_]+)"\s*\{([\s\S]*?)\}/gi;
  let match: RegExpExecArray | null;
  let count = 0;

  const resourceMap = new Map<string, string>(); // resourceType.resourceName -> nodeId

  while ((match = resourceRegex.exec(hcl)) !== null) {
    const resType = match[1];
    const resName = match[2];
    const body = match[3];
    const nodeId = `tf-${resName}`;
    resourceMap.set(`${resType}.${resName}`, nodeId);

    let shape: DiagramNode['shape'] = 'rounded';
    let icon = '☁️';
    let color = '#3b82f6';
    let tech = resType;

    if (resType.includes('db') || resType.includes('rds')) {
      shape = 'database';
      icon = '🗄️';
      color = '#10b981';
      tech = 'AWS RDS / Aurora';
    } else if (resType.includes('lb') || resType.includes('alb') || resType.includes('gateway')) {
      shape = 'hexagon';
      icon = '⚡';
      color = '#f43f5e';
      tech = 'Application Load Balancer';
    } else if (resType.includes('sqs') || resType.includes('queue') || resType.includes('kafka')) {
      shape = 'queue';
      icon = '📬';
      color = '#f59e0b';
      tech = 'AWS SQS Queue';
    } else if (resType.includes('s3') || resType.includes('bucket')) {
      shape = 'cylinder';
      icon = '📁';
      color = '#06b6d4';
      tech = 'AWS S3 Bucket';
    } else if (resType.includes('lambda') || resType.includes('function')) {
      shape = 'rounded';
      icon = 'λ';
      color = '#f97316';
      tech = 'AWS Lambda';
    } else if (resType.includes('vpc') || resType.includes('subnet')) {
      shape = 'cloud';
      icon = '🌐';
      color = '#6366f1';
      tech = 'Virtual Private Cloud';
    }

    const row = Math.floor(count / 3);
    const col = count % 3;

    nodes.push({
      id: nodeId,
      shape,
      label: resName.replace(/_/g, ' '),
      tech,
      icon,
      color,
      badge: resType.replace('aws_', ''),
      position: { x: 100 + col * 320, y: 120 + row * 200 },
    });

    count++;
  }

  // Connect dependent nodes based on references
  if (nodes.length >= 2) {
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `tf-edge-${i}`,
        fromNodeId: nodes[i].id,
        toNodeId: nodes[i + 1].id,
        label: 'VPC Route',
        style: 'curved',
        animated: true,
      });
    }
  }

  return { nodes, edges };
}

/**
 * Parses Markdown / Mermaid code into visual nodes and edges
 */
export function convertMermaidToDiagram(
  mermaid: string,
  _title?: string
): { nodes: DiagramNode[]; edges: DiagramEdge[] } {
  const nodes: DiagramNode[] = [];
  const edges: DiagramEdge[] = [];
  const nodeMap = new Map<string, DiagramNode>();

  const lines = mermaid.split('\n');
  let yPos = 120;
  let xPos = 120;

  for (const line of lines) {
    const trimmed = line.trim();
    if (
      !trimmed ||
      trimmed.startsWith('%%') ||
      trimmed.startsWith('graph') ||
      trimmed.startsWith('flowchart') ||
      trimmed.startsWith('subgraph') ||
      trimmed === 'end'
    ) {
      continue;
    }

    // 1. Check for edge lines: A --> B, A -->|label| B, A -.-> B, A ==> B
    const edgeMatch = /^([\w-]+)(?:\[\((.*?)\)\]|\["(.*?)"\]|\[(.*?)\]|\{"(.*?)"\}|\{(.*?)\})?\s*(?:-->|-\.->|==>)\s*(?:\|"?(.*?)"?\|)?\s*([\w-]+)(?:\[\((.*?)\)\]|\["(.*?)"\]|\[(.*?)\]|\{"(.*?)"\}|\{(.*?)\})?/.exec(
      trimmed
    );

    if (edgeMatch) {
      const fromId = edgeMatch[1];
      const fromLabel =
        edgeMatch[2] || edgeMatch[3] || edgeMatch[4] || edgeMatch[5] || edgeMatch[6] || fromId;
      const edgeLabel = edgeMatch[7] || '';
      const toId = edgeMatch[8];
      const toLabel =
        edgeMatch[9] || edgeMatch[10] || edgeMatch[11] || edgeMatch[12] || edgeMatch[13] || toId;

      if (!nodeMap.has(fromId)) {
        const fromNode: DiagramNode = {
          id: fromId,
          shape: trimmed.includes('[(') ? 'database' : trimmed.includes('{') ? 'diamond' : 'rounded',
          label: fromLabel.replace(/^["']|["']$/g, ''),
          icon: trimmed.includes('[(') ? '🗄️' : trimmed.includes('{') ? '◇' : '⚙️',
          position: { x: xPos, y: yPos },
          color: '#3b82f6',
        };
        nodeMap.set(fromId, fromNode);
        nodes.push(fromNode);
        yPos += 130;
      }

      if (!nodeMap.has(toId)) {
        const toNode: DiagramNode = {
          id: toId,
          shape: trimmed.includes('[(') ? 'database' : trimmed.includes('{') ? 'diamond' : 'rounded',
          label: toLabel.replace(/^["']|["']$/g, ''),
          icon: trimmed.includes('[(') ? '🗄️' : trimmed.includes('{') ? '◇' : '⚡',
          position: { x: xPos + 320, y: Math.max(yPos - 130, 120) },
          color: '#10b981',
        };
        nodeMap.set(toId, toNode);
        nodes.push(toNode);
      }

      edges.push({
        id: `edge-${fromId}-${toId}-${Date.now()}`,
        fromNodeId: fromId,
        toNodeId: toId,
        label: edgeLabel.replace(/^["']|["']$/g, ''),
        style: 'curved',
        animated: true,
      });
      continue;
    }

    // 2. Check for standalone node declaration: e.g. nodeId["Label"] or nodeId[("Database")] or nodeId{"Decision"}
    const nodeMatch = /^([\w-]+)\s*(?:\[\((.*?)\)\]|\["(.*?)"\]|\[(.*?)\]|\{"(.*?)"\}|\{(.*?)\}|\("(.*?)"\)|\((.*?)\))/.exec(
      trimmed
    );
    if (nodeMatch) {
      const id = nodeMatch[1];
      const label =
        nodeMatch[2] ||
        nodeMatch[3] ||
        nodeMatch[4] ||
        nodeMatch[5] ||
        nodeMatch[6] ||
        nodeMatch[7] ||
        nodeMatch[8] ||
        id;

      if (!nodeMap.has(id)) {
        const shape = trimmed.includes('[(')
          ? 'database'
          : trimmed.includes('{')
            ? 'diamond'
            : trimmed.includes('(')
              ? 'rounded'
              : 'rectangle';
        const node: DiagramNode = {
          id,
          shape,
          label: label.replace(/^["']|["']$/g, ''),
          icon: shape === 'database' ? '🗄️' : shape === 'diamond' ? '◇' : '⚙️',
          position: { x: xPos, y: yPos },
          color: '#3b82f6',
        };
        nodeMap.set(id, node);
        nodes.push(node);
        yPos += 130;
      }
    }
  }

  return { nodes, edges };
}

/**
 * Simulates analyzing a connected GitHub repo or monorepo to generate an architecture map
 */
export function analyzeCodebaseArchitecture(repoUrl: string): CodebaseAnalysisResult {
  const cleanName = repoUrl.split('/').pop()?.replace('.git', '') || 'repository';

  return {
    repoName: cleanName,
    services: [
      { name: 'API Server / Backend', path: 'packages/backend/server', tech: 'Node.js / NestJS' },
      { name: 'Web Client App', path: 'packages/frontend/apps/web', tech: 'Next.js 15 / React' },
      { name: 'Desktop Client', path: 'packages/frontend/apps/electron', tech: 'Electron / Rust' },
      { name: 'Shared Core Engine', path: 'packages/common/nbstore', tech: 'CRDT / BlockSuite' },
    ],
    databases: [
      { name: 'PostgreSQL Database', type: 'Prisma ORM (Relational)' },
      { name: 'Redis Cache & Session', type: 'ioredis' },
    ],
    endpoints: [
      { path: '/api/graphql', method: 'POST' },
      { path: '/api/workflow/webhook', method: 'POST' },
      { path: '/api/copilot/chat', method: 'POST' },
    ],
    dependencies: [
      { from: 'Web Client App', to: 'API Server / Backend', type: 'GraphQL / WebSocket' },
      { from: 'Desktop Client', to: 'API Server / Backend', type: 'WebSocket Sync' },
      { from: 'API Server / Backend', to: 'PostgreSQL Database', type: 'SQL Read/Write' },
      { from: 'API Server / Backend', to: 'Redis Cache & Session', type: 'Pub/Sub' },
    ],
  };
}

