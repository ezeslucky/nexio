import type { DiagramEdge, DiagramItem, DiagramNode, DiagramType } from '../types';

/**
 * Intelligent Layout Engine that arranges nodes into structured architectural tiers
 */
export function autoLayoutDiagram(
  nodesOrDiagram: DiagramNode[],
  edges?: DiagramEdge[]
): DiagramNode[];
export function autoLayoutDiagram(
  nodesOrDiagram: DiagramItem
): DiagramItem;
export function autoLayoutDiagram(
  nodesOrDiagram: DiagramNode[] | DiagramItem,
  edges?: DiagramEdge[]
): DiagramNode[] | DiagramItem {
  let nodes: DiagramNode[];
  let isFullDiagram = false;

  if ('nodes' in nodesOrDiagram && Array.isArray((nodesOrDiagram as any).nodes)) {
    nodes = (nodesOrDiagram as DiagramItem).nodes;
    isFullDiagram = true;
  } else {
    nodes = nodesOrDiagram as DiagramNode[];
  }
  // Categorize nodes into logical tiers
  const tierMap: Record<string, number> = {
    client: 0,
    actor: 0,
    user: 0,
    cdn: 1,
    waf: 1,
    cloud: 1,
    ingress: 2,
    gateway: 2,
    lb: 2,
    balancer: 2,
    service: 3,
    api: 3,
    backend: 3,
    auth: 3,
    app: 3,
    queue: 4,
    cache: 4,
    redis: 4,
    kafka: 4,
    db: 5,
    database: 5,
    postgres: 5,
    mongo: 5,
    storage: 5,
    s3: 5,
  };

  const tiers: DiagramNode[][] = [[], [], [], [], [], []];

  for (const node of nodes) {
    let assignedTier = 3; // Default to service tier
    const labelLower = `${node.label} ${node.tech || ''} ${node.shape}`.toLowerCase();

    for (const [key, tierIndex] of Object.entries(tierMap)) {
      if (labelLower.includes(key)) {
        assignedTier = tierIndex;
        break;
      }
    }

    tiers[assignedTier].push(node);
  }

  const result: DiagramNode[] = [];
  const startX = 80;
  const colWidth = 260;

  tiers.forEach((tierNodes, tierIdx) => {
    const totalInTier = tierNodes.length;
    tierNodes.forEach((node, nodeIdx) => {
      const x = startX + tierIdx * colWidth;
      const y = 100 + nodeIdx * 160 + (totalInTier > 1 ? 20 : 60);
      result.push({
        ...node,
        position: { x, y },
      });
    });
  });

  if (isFullDiagram) {
    return {
      ...(nodesOrDiagram as DiagramItem),
      nodes: result,
      updatedAt: Date.now(),
    };
  }

  return result;
}

/**
 * Generates complete diagram from natural language prompt
 */
export function generateDiagramFromPrompt(
  prompt: string,
  targetType: DiagramType = 'system_architecture'
): { title: string; nodes: DiagramNode[]; edges: DiagramEdge[] } {
  const p = prompt.toLowerCase();
  const title = prompt.length > 50 ? `${prompt.slice(0, 48)}...` : prompt;

  const rawNodes: DiagramNode[] = [];
  const rawEdges: DiagramEdge[] = [];

  // Flowchart prompt detection
  if (targetType === 'flowchart' || p.includes('flowchart') || p.includes('decision tree') || p.includes('algorithm')) {
    rawNodes.push(
      { id: 'start', shape: 'rounded', label: 'Start Request', icon: '▶️', color: '#10b981', position: { x: 80, y: 160 } },
      { id: 'step-validate', shape: 'rounded', label: 'Validate Input & Auth', icon: '🔍', color: '#3b82f6', position: { x: 300, y: 160 } },
      { id: 'decision', shape: 'diamond', label: 'Is Valid & Authorized?', icon: '◇', color: '#f59e0b', position: { x: 520, y: 160 } },
      { id: 'step-process', shape: 'rounded', label: 'Process Core Logic', icon: '⚙️', color: '#10b981', position: { x: 740, y: 100 } },
      { id: 'step-error', shape: 'rounded', label: 'Return 401/400 Error', icon: '✕', color: '#ef4444', position: { x: 740, y: 240 } },
      { id: 'end', shape: 'rounded', label: 'Return Success (200 OK)', icon: '✓', color: '#10b981', position: { x: 960, y: 100 } }
    );
    rawEdges.push(
      { id: 'e1', fromNodeId: 'start', toNodeId: 'step-validate', style: 'curved', animated: true },
      { id: 'e2', fromNodeId: 'step-validate', toNodeId: 'decision', style: 'curved' },
      { id: 'e3', fromNodeId: 'decision', toNodeId: 'step-process', label: 'Yes (Valid)', style: 'curved', color: '#10b981' },
      { id: 'e4', fromNodeId: 'decision', toNodeId: 'step-error', label: 'No (Invalid)', style: 'curved', color: '#ef4444' },
      { id: 'e5', fromNodeId: 'step-process', toNodeId: 'end', label: 'Completed', style: 'curved', animated: true }
    );
    return { title, nodes: rawNodes, edges: rawEdges };
  }

  // Sequence diagram prompt detection
  if (targetType === 'sequence' || p.includes('sequence') || p.includes('lifeline')) {
    rawNodes.push(
      { id: 'client', shape: 'actor', label: 'Client / App', icon: '👤', color: '#38bdf8', position: { x: 80, y: 160 } },
      { id: 'gateway', shape: 'rounded', label: 'API Gateway', tech: 'Envoy', icon: '⚡', color: '#f43f5e', position: { x: 340, y: 160 } },
      { id: 'auth', shape: 'rounded', label: 'Auth Service', tech: 'OAuth / JWT', icon: '🔒', color: '#a855f7', position: { x: 600, y: 160 } },
      { id: 'db', shape: 'database', label: 'User Database', tech: 'PostgreSQL', icon: '🗄️', color: '#10b981', position: { x: 860, y: 160 } }
    );
    rawEdges.push(
      { id: 'e1', fromNodeId: 'client', toNodeId: 'gateway', label: '1. POST /login (credentials)', style: 'straight', animated: true },
      { id: 'e2', fromNodeId: 'gateway', toNodeId: 'auth', label: '2. VerifyCredentials()', style: 'straight' },
      { id: 'e3', fromNodeId: 'auth', toNodeId: 'db', label: '3. SELECT password_hash', style: 'straight' },
      { id: 'e4', fromNodeId: 'db', toNodeId: 'auth', label: '4. Return User Record', style: 'straight' },
      { id: 'e5', fromNodeId: 'auth', toNodeId: 'gateway', label: '5. Signed JWT Access Token', style: 'straight' },
      { id: 'e6', fromNodeId: 'gateway', toNodeId: 'client', label: '6. 200 OK + Set-Cookie', style: 'straight', animated: true }
    );
    return { title, nodes: rawNodes, edges: rawEdges };
  }

  // Standard Architecture Generation from keywords in prompt
  // 1. Client / Frontend
  rawNodes.push({
    id: 'client',
    shape: 'actor',
    label: p.includes('mobile') ? 'Mobile & Web Clients' : 'Web Browser Client',
    tech: 'React / Next.js',
    icon: '💻',
    color: '#38bdf8',
    position: { x: 80, y: 180 },
  });

  // 2. Load Balancer / Gateway
  const hasGateway =
    p.includes('gateway') ||
    p.includes('load balancer') ||
    p.includes('ingress') ||
    p.includes('api') ||
    p.includes('microservice') ||
    p.includes('architecture');

  if (hasGateway) {
    rawNodes.push({
      id: 'gateway',
      shape: 'hexagon',
      label: p.includes('load balancer') ? 'Application Load Balancer' : 'API Gateway',
      tech: 'Kong / Envoy Gateway',
      badge: 'SSL / Rate Limit',
      icon: '⚡',
      color: '#f43f5e',
      position: { x: 300, y: 180 },
    });
    rawEdges.push({
      id: 'e-client-gateway',
      fromNodeId: 'client',
      toNodeId: 'gateway',
      label: 'HTTPS / REST',
      style: 'curved',
      animated: true,
    });
  }

  const ingressSourceId = hasGateway ? 'gateway' : 'client';

  // 3. Auth Service
  if (p.includes('auth') || p.includes('authentication') || p.includes('user')) {
    rawNodes.push({
      id: 'auth-svc',
      shape: 'rounded',
      label: 'Authentication Service',
      tech: 'Node.js / OIDC',
      icon: '🔒',
      color: '#a855f7',
      position: { x: 540, y: 100 },
    });
    rawEdges.push({
      id: 'e-ingress-auth',
      fromNodeId: ingressSourceId,
      toNodeId: 'auth-svc',
      label: 'Token Verify',
      style: 'curved',
    });
  }

  // 4. Microservices
  rawNodes.push({
    id: 'core-svc',
    shape: 'rounded',
    label: p.includes('user service') ? 'User Service' : 'Core Business API',
    tech: 'Go / Python / Node.js',
    icon: '⚙️',
    color: '#3b82f6',
    position: { x: 540, y: 240 },
  });
  rawEdges.push({
    id: 'e-ingress-core',
    fromNodeId: ingressSourceId,
    toNodeId: 'core-svc',
    label: 'gRPC / JSON-RPC',
    style: 'curved',
    animated: true,
  });

  // 5. Message Queue
  if (p.includes('queue') || p.includes('message') || p.includes('kafka') || p.includes('rabbitmq')) {
    rawNodes.push({
      id: 'queue-svc',
      shape: 'queue',
      label: p.includes('kafka') ? 'Apache Kafka' : p.includes('rabbitmq') ? 'RabbitMQ' : 'Message Queue Broker',
      tech: 'Distributed Pub/Sub',
      badge: 'Async',
      icon: '📬',
      color: '#f59e0b',
      position: { x: 780, y: 320 },
    });
    rawEdges.push({
      id: 'e-core-queue',
      fromNodeId: 'core-svc',
      toNodeId: 'queue-svc',
      label: 'Publish Event',
      style: 'curved',
      animated: true,
    });
  }

  // 6. Redis / Cache
  if (p.includes('redis') || p.includes('cache') || p.includes('memcached')) {
    rawNodes.push({
      id: 'cache-svc',
      shape: 'cylinder',
      label: 'In-Memory Cache',
      tech: 'Redis Cluster 7.2',
      badge: 'RAM < 1ms',
      icon: '⚡',
      color: '#ef4444',
      position: { x: 780, y: 100 },
    });
    rawEdges.push({
      id: 'e-core-cache',
      fromNodeId: 'core-svc',
      toNodeId: 'cache-svc',
      label: 'Cache Get/Set',
      style: 'curved',
    });
  }

  // 7. Database
  const dbTech = p.includes('postgres')
    ? 'PostgreSQL 16'
    : p.includes('mongo')
      ? 'MongoDB Replica'
      : p.includes('mysql')
        ? 'MySQL 8'
        : 'PostgreSQL Relational DB';

  rawNodes.push({
    id: 'db-svc',
    shape: 'database',
    label: p.includes('mongo') ? 'Document Store' : 'Relational Database',
    tech: dbTech,
    badge: 'Persistent ACID',
    icon: '🗄️',
    color: '#10b981',
    position: { x: 780, y: 220 },
  });
  rawEdges.push({
    id: 'e-core-db',
    fromNodeId: 'core-svc',
    toNodeId: 'db-svc',
    label: 'Query & Mutation',
    style: 'curved',
  });

  const laidOutNodes = autoLayoutDiagram(rawNodes, rawEdges);
  return { title, nodes: laidOutNodes, edges: rawEdges };
}

/**
 * Applies conversational AI edit requests to an existing diagram in-place
 */
export function applyAiEditToDiagram(
  currentDiagram: DiagramItem,
  chatPrompt: string
): { updatedDiagram: DiagramItem; actionTaken: string; explanation: string } {
  const p = chatPrompt.toLowerCase().trim();
  const nodes = [...currentDiagram.nodes];
  const edges = [...currentDiagram.edges];

  let actionTaken = 'Updated Diagram';
  let explanation = 'I have adjusted the architectural diagram based on your request.';

  // 1. "Add Redis cache" / "Add cache"
  if (p.includes('redis') || p.includes('cache')) {
    const exists = nodes.some(n => n.id === 'ai-redis-cache' || n.label.toLowerCase().includes('redis'));
    if (!exists) {
      const newNode: DiagramNode = {
        id: `ai-redis-${Date.now()}`,
        shape: 'cylinder',
        label: 'Redis Cache Layer',
        tech: 'Redis 7.2',
        badge: 'Sub-millisecond',
        icon: '⚡',
        color: '#ef4444',
        position: { x: 780, y: 80 },
      };
      nodes.push(newNode);

      // Connect to first service found
      const serviceNode = nodes.find(n => n.shape === 'rounded' || n.label.toLowerCase().includes('service'));
      if (serviceNode) {
        edges.push({
          id: `edge-cache-${Date.now()}`,
          fromNodeId: serviceNode.id,
          toNodeId: newNode.id,
          label: 'Cache-Aside Read/Write',
          style: 'curved',
          animated: true,
        });
      }

      actionTaken = 'Added Redis Cache Layer';
      explanation = 'Introduced a high-performance Redis cache cluster and connected it to your service layer for fast data retrieval.';
    } else {
      actionTaken = 'Cache Already Present';
      explanation = 'A Redis cache node is already active in this architecture.';
    }
  }

  // 2. "Add load balancing" / "Add load balancer"
  else if (p.includes('load balance') || p.includes('loadbalancer')) {
    const lbNode: DiagramNode = {
      id: `ai-alb-${Date.now()}`,
      shape: 'hexagon',
      label: 'Cloud Load Balancer (ALB)',
      tech: 'AWS ALB / Round-Robin',
      icon: '⚖️',
      color: '#f43f5e',
      position: { x: 320, y: 160 },
    };
    nodes.push(lbNode);

    const clientNode = nodes.find(n => n.shape === 'actor' || n.label.toLowerCase().includes('client'));
    if (clientNode) {
      edges.push({
        id: `edge-lb-${Date.now()}`,
        fromNodeId: clientNode.id,
        toNodeId: lbNode.id,
        label: 'Incoming Traffic (443)',
        style: 'curved',
        animated: true,
      });
    }

    actionTaken = 'Added Load Balancer';
    explanation = 'Placed an Application Load Balancer at the edge to distribute traffic across redundant backend instances.';
  }

  // 3. "Change database to MongoDB"
  else if (p.includes('mongo') || p.includes('mongodb')) {
    let replaced = false;
    nodes.forEach(n => {
      if (n.shape === 'database' || n.label.toLowerCase().includes('database') || n.label.toLowerCase().includes('postgres')) {
        n.label = 'MongoDB NoSQL Cluster';
        n.tech = 'MongoDB Atlas 7.0';
        n.badge = 'Document Store';
        n.color = '#10b981';
        n.icon = '🍃';
        replaced = true;
      }
    });

    actionTaken = 'Migrated Database to MongoDB';
    explanation = replaced
      ? 'Swapped your primary relational database store with a scalable MongoDB document database cluster.'
      : 'Configured MongoDB as your data persistence engine.';
  }

  // 4. "Connect API Gateway to authentication"
  else if (p.includes('connect') && (p.includes('gateway') || p.includes('auth'))) {
    const gateway = nodes.find(n => n.label.toLowerCase().includes('gateway') || n.id === 'gateway');
    const auth = nodes.find(n => n.label.toLowerCase().includes('auth'));

    if (gateway && auth) {
      edges.push({
        id: `edge-auth-connect-${Date.now()}`,
        fromNodeId: gateway.id,
        toNodeId: auth.id,
        label: 'JWT Auth Check',
        style: 'curved',
        animated: true,
      });
      actionTaken = 'Connected Gateway to Auth';
      explanation = 'Established an active authentication validation route between the API Gateway and Authentication service.';
    }
  }

  // 5. "Make the architecture more scalable"
  else if (p.includes('scalable') || p.includes('scale')) {
    const queueNode: DiagramNode = {
      id: `ai-queue-${Date.now()}`,
      shape: 'queue',
      label: 'Async Message Queue (Kafka)',
      tech: 'Apache Kafka',
      badge: 'Decoupled',
      icon: '📬',
      color: '#f59e0b',
      position: { x: 700, y: 340 },
    };
    nodes.push(queueNode);

    const serviceNode = nodes.find(n => n.shape === 'rounded');
    if (serviceNode) {
      edges.push({
        id: `edge-scalable-${Date.now()}`,
        fromNodeId: serviceNode.id,
        toNodeId: queueNode.id,
        label: 'Async Worker Task',
        style: 'curved',
        animated: true,
      });
    }

    actionTaken = 'Enhanced Architectural Scalability';
    explanation = 'Decoupled your synchronous request paths by adding an asynchronous Kafka event queue to handle traffic spikes smoothly.';
  }

  // 6. "Find architectural problems" / "Audit"
  else if (p.includes('problem') || p.includes('audit') || p.includes('vulnerability') || p.includes('single point')) {
    actionTaken = 'Completed Architectural Health Audit';
    explanation = `### Architectural Health & Reliability Audit
- **Single Point of Failure (SPOF)**: Verified database redundancy — recommended adding read replicas.
- **Cache Strategy**: In-memory caching minimizes DB latency on read-heavy routes.
- **Security**: Ingress traffic should enforce TLS 1.3 encryption and API rate limiting.
- **Resilience**: Backoff retries and circuit breakers should be configured on all inter-service gRPC calls.`;
  }

  // 7. "Explain this diagram"
  else if (p.includes('explain') || p.includes('how it works') || p.includes('overview')) {
    actionTaken = 'Generated Architecture Breakdown';
    explanation = `### Architecture Overview
This system consists of **${nodes.length} components** connected by **${edges.length} data streams**:
1. **Entry Tier**: Traffic initiates from user clients and passes through ingress security.
2. **Compute Tier**: Microservices process business transactions and enforce validation.
3. **Data Tier**: State is stored reliably in database engines with cache accelerators.`;
  }

  const updatedDiagram: DiagramItem = {
    ...currentDiagram,
    nodes: autoLayoutDiagram(nodes, edges),
    edges,
    version: currentDiagram.version + 1,
    updatedAt: Date.now(),
    history: [
      ...(currentDiagram.history || []),
      {
        timestamp: Date.now(),
        label: actionTaken,
        snapshot: JSON.stringify({ nodes, edges }),
      },
    ],
  };

  return { updatedDiagram, actionTaken, explanation };
}
