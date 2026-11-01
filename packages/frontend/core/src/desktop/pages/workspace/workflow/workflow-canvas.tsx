import { Button, IconButton, Switch } from '@nexio/component';
import { notify } from '@nexio/component/ui/notification';
import {
  ArrowLeftBigIcon,
  CloseIcon,
  DeleteIcon,
  PlusIcon,
  SearchIcon,
} from '@blocksuite/icons/rc';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { NODE_CATALOG } from './defaults';
import type {
  NodeCategory,
  NodeDefinition,
  WorkflowConnection,
  WorkflowItem,
  WorkflowNode,
  WorkflowPort,
} from './types';

interface WorkflowCanvasProps {
  workflow: WorkflowItem;
  onUpdateWorkflow: (updated: WorkflowItem) => void;
  onBack: () => void;
}

const CATEGORY_COLORS: Record<NodeCategory, { bg: string; text: string; border: string }> = {
  trigger: { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
  ai: { bg: 'rgba(236, 72, 153, 0.12)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.3)' },
  logic: { bg: 'rgba(234, 179, 8, 0.12)', text: '#eab308', border: 'rgba(234, 179, 8, 0.3)' },
  data: { bg: 'rgba(6, 182, 212, 0.12)', text: '#06b6d4', border: 'rgba(6, 182, 212, 0.3)' },
  developer: { bg: 'rgba(99, 102, 241, 0.12)', text: '#6366f1', border: 'rgba(99, 102, 241, 0.3)' },
  browser: { bg: 'rgba(249, 115, 22, 0.12)', text: '#f97316', border: 'rgba(249, 115, 22, 0.3)' },
  human: { bg: 'rgba(20, 184, 166, 0.12)', text: '#14b8a6', border: 'rgba(20, 184, 166, 0.3)' },
  utility: { bg: 'rgba(139, 92, 246, 0.12)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' },
  integration: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
  action: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
};

type FilterCategory =
  | 'all'
  | 'triggers'
  | 'ai_agents'
  | 'logic_flow'
  | 'data_processing'
  | 'developer_tools'
  | 'browser_automation'
  | 'human_interaction'
  | 'monitoring_utilities';

const FILTER_CATEGORY_MAP: Record<FilterCategory, { label: string; match: (def: NodeDefinition) => boolean }> = {
  all: { label: 'All Nodes', match: () => true },
  triggers: { label: 'Triggers', match: def => def.category === 'trigger' || Boolean(def.tags?.includes('trigger')) },
  ai_agents: { label: 'AI & Agents', match: def => def.category === 'ai' || Boolean(def.tags?.includes('ai')) },
  logic_flow: { label: 'Logic & Flow', match: def => def.category === 'logic' || Boolean(def.tags?.includes('logic')) },
  data_processing: { label: 'Data Processing', match: def => def.category === 'data' || Boolean(def.tags?.includes('data')) },
  developer_tools: { label: 'Developer Tools', match: def => def.category === 'developer' || Boolean(def.tags?.includes('developer')) },
  browser_automation: { label: 'Browser Automation', match: def => def.category === 'browser' || Boolean(def.tags?.includes('browser')) },
  human_interaction: { label: 'Human Interaction', match: def => def.category === 'human' || Boolean(def.tags?.includes('human')) },
  monitoring_utilities: {
    label: 'Monitoring & Utilities',
    match: def => def.category === 'utility' || Boolean(def.tags?.includes('utility')),
  },
};

interface ValidationError {
  field: string;
  message: string;
}

function sanitizeForLogging(obj: any): any {
  if (!obj || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForLogging);
  const out: Record<string, any> = {};
  for (const k of Object.keys(obj)) {
    const lk = k.toLowerCase();
    if (
      lk.includes('token') ||
      lk.includes('secret') ||
      lk.includes('password') ||
      lk.includes('auth') ||
      lk.includes('apikey')
    ) {
      out[k] = '••••••••[PROTECTED]';
    } else if (typeof obj[k] === 'object') {
      out[k] = sanitizeForLogging(obj[k]);
    } else {
      out[k] = obj[k];
    }
  }
  return out;
}

function validateNodeConfig(node: WorkflowNode): ValidationError[] {
  const errors: ValidationError[] = [];
  if (!node.name.trim()) {
    errors.push({ field: 'name', message: 'Node name is required.' });
  }

  const cfg = node.config || {};

  switch (node.subType) {
    case 'http_request':
      if (!cfg.url || !cfg.url.trim()) {
        errors.push({ field: 'url', message: 'Request URL is required.' });
      } else if (!cfg.url.startsWith('http://') && !cfg.url.startsWith('https://') && !cfg.url.startsWith('{{')) {
        errors.push({ field: 'url', message: 'URL must start with http://, https://, or a {{template}} expression.' });
      }
      break;
    case 'graphql_request':
      if (!cfg.endpoint || !cfg.endpoint.trim()) {
        errors.push({ field: 'endpoint', message: 'GraphQL endpoint URL is required.' });
      }
      if (!cfg.query || !cfg.query.trim()) {
        errors.push({ field: 'query', message: 'GraphQL query/mutation body cannot be empty.' });
      }
      break;
    case 'browser_automation':
      if (!cfg.targetUrl || !cfg.targetUrl.trim()) {
        errors.push({ field: 'targetUrl', message: 'Target website URL is required.' });
      }
      break;
    case 'human_approval':
      if (!cfg.approverEmail || !cfg.approverEmail.trim()) {
        errors.push({ field: 'approverEmail', message: 'Approver email or group address is required.' });
      }
      if (!cfg.approvalTitle || !cfg.approvalTitle.trim()) {
        errors.push({ field: 'approvalTitle', message: 'Approval title is required.' });
      }
      break;
    case 'prompt_optimizer':
      if (!cfg.inputPrompt || !cfg.inputPrompt.trim()) {
        errors.push({ field: 'inputPrompt', message: 'Input prompt to optimize cannot be empty.' });
      }
      break;
    case 'database_query':
      if (!cfg.query || !cfg.query.trim()) {
        errors.push({ field: 'query', message: 'SQL/NoSQL query cannot be empty.' });
      }
      if (!cfg.connectionString || !cfg.connectionString.trim()) {
        errors.push({ field: 'connectionString', message: 'Database connection URI is required.' });
      }
      break;
    case 'send_email':
      if (!cfg.to || !cfg.to.trim()) {
        errors.push({ field: 'to', message: 'Recipient email address is required.' });
      } else if (!cfg.to.includes('@') && !cfg.to.startsWith('{{')) {
        errors.push({ field: 'to', message: 'Please provide a valid email or {{template}}.' });
      }
      if (!cfg.subject || !cfg.subject.trim()) {
        errors.push({ field: 'subject', message: 'Email subject is required.' });
      }
      break;
    case 'notification':
      if (!cfg.webhookUrl && !cfg.recipient) {
        errors.push({ field: 'target', message: 'Webhook URL or Channel recipient is required.' });
      }
      if (!cfg.message || !cfg.message.trim()) {
        errors.push({ field: 'message', message: 'Notification message cannot be empty.' });
      }
      break;
    case 'file_storage':
      if (!cfg.bucket || !cfg.bucket.trim()) {
        errors.push({ field: 'bucket', message: 'Storage bucket name is required.' });
      }
      if (!cfg.fileKey || !cfg.fileKey.trim()) {
        errors.push({ field: 'fileKey', message: 'File Key / path is required.' });
      }
      break;
    case 'regex_extractor':
      if (!cfg.pattern || !cfg.pattern.trim()) {
        errors.push({ field: 'pattern', message: 'Regular expression pattern is required.' });
      }
      break;
    case 'ai_decision_maker':
      if (!cfg.decisionPrompt || !cfg.decisionPrompt.trim()) {
        errors.push({ field: 'decisionPrompt', message: 'Decision criteria prompt cannot be empty.' });
      }
      break;
    case 'multi_agent_coordinator':
      if (!cfg.roles || !cfg.roles.trim()) {
        errors.push({ field: 'roles', message: 'At least one agent role must be configured.' });
      }
      break;
    case 'sub_workflow':
      if (!cfg.targetWorkflowId || !cfg.targetWorkflowId.trim()) {
        errors.push({ field: 'targetWorkflowId', message: 'Target sub-workflow ID is required.' });
      }
      break;
    case 'wait_for_event':
      if (!cfg.eventType || !cfg.eventType.trim()) {
        errors.push({ field: 'eventType', message: 'Target event type/topic is required.' });
      }
      break;
    case 'workflow_cancel':
      if (!cfg.cancelReason || !cfg.cancelReason.trim()) {
        errors.push({ field: 'cancelReason', message: 'Cancellation reason is required.' });
      }
      break;
    case 'smart_scheduler':
      if (!cfg.timezone || !cfg.timezone.trim()) {
        errors.push({ field: 'timezone', message: 'Timezone identifier is required.' });
      }
      break;
  }

  return errors;
}

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow: initialWorkflow,
  onUpdateWorkflow,
  onBack,
}) => {
  const [workflow, setWorkflow] = useState<WorkflowItem>(initialWorkflow);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<
    Array<{ timestamp: string; nodeName: string; status: string; data: any }>
  >([]);

  // Palette filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>('all');

  // Node drawer validation errors
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Interactive human approval state during live execution
  const [pendingApproval, setPendingApproval] = useState<{
    node: WorkflowNode;
    resolve: (decision: 'approved' | 'rejected' | 'changes_requested') => void;
  } | null>(null);

  // Connecting handles state
  const [connectingFrom, setConnectingFrom] = useState<{
    nodeId: string;
    port: string;
    x: number;
    y: number;
  } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Dragging node state
  const [draggingNode, setDraggingNode] = useState<{
    id: string;
    startX: number;
    startY: number;
    nodeX: number;
    nodeY: number;
  } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync state upward when workflow changes
  const updateWorkflowState = useCallback(
    (updater: (prev: WorkflowItem) => WorkflowItem) => {
      setWorkflow(prev => {
        const next = updater(prev);
        onUpdateWorkflow(next);
        return next;
      });
    },
    [onUpdateWorkflow]
  );

  // Filtered catalog for palette
  const filteredCatalog = useMemo(() => {
    return NODE_CATALOG.filter(def => {
      const catConfig = FILTER_CATEGORY_MAP[selectedCategory];
      const matchesCat = catConfig ? catConfig.match(def) : true;

      let matchesSearch = true;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        matchesSearch =
          def.name.toLowerCase().includes(q) ||
          def.description.toLowerCase().includes(q) ||
          def.subType.toLowerCase().includes(q) ||
          Boolean(def.tags?.some(t => t.toLowerCase().includes(q)));
      }

      return matchesCat && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Category counts for badges
  const categoryCounts = useMemo(() => {
    const counts: Record<FilterCategory, number> = {
      all: NODE_CATALOG.length,
      triggers: 0,
      ai_agents: 0,
      logic_flow: 0,
      data_processing: 0,
      developer_tools: 0,
      browser_automation: 0,
      human_interaction: 0,
      monitoring_utilities: 0,
    };

    NODE_CATALOG.forEach(def => {
      (Object.keys(FILTER_CATEGORY_MAP) as FilterCategory[]).forEach(cat => {
        if (cat !== 'all' && FILTER_CATEGORY_MAP[cat].match(def)) {
          counts[cat]++;
        }
      });
    });

    return counts;
  }, []);

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    if ((e.target as HTMLElement).closest('.port-handle')) return;
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setValidationErrors([]);
    setDraggingNode({
      id: node.id,
      startX: e.clientX,
      startY: e.clientY,
      nodeX: node.position.x,
      nodeY: node.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;
    setMousePos({ x: curX, y: curY });

    if (draggingNode) {
      const deltaX = e.clientX - draggingNode.startX;
      const deltaY = e.clientY - draggingNode.startY;
      const newX = Math.max(20, draggingNode.nodeX + deltaX);
      const newY = Math.max(20, draggingNode.nodeY + deltaY);

      updateWorkflowState(prev => ({
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === draggingNode.id ? { ...n, position: { x: newX, y: newY } } : n
        ),
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
    setConnectingFrom(null);
  };

  // Port connection handler
  const handleStartConnect = (e: React.MouseEvent, nodeId: string, port: string) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const handleRect = (e.target as HTMLElement).getBoundingClientRect();
    setConnectingFrom({
      nodeId,
      port,
      x: handleRect.left + handleRect.width / 2 - rect.left,
      y: handleRect.top + handleRect.height / 2 - rect.top,
    });
  };

  const handleEndConnect = useCallback(
    (e: React.MouseEvent, targetNodeId: string, targetPort: string) => {
      e.stopPropagation();
      if (!connectingFrom || connectingFrom.nodeId === targetNodeId) {
        setConnectingFrom(null);
        return;
      }

      // Add new connection if not duplicate
      const newConn: WorkflowConnection = {
        id: `conn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        fromNodeId: connectingFrom.nodeId,
        fromPort: connectingFrom.port,
        toNodeId: targetNodeId,
        toPort: targetPort,
      };

      updateWorkflowState(prev => {
        const exists = prev.connections.some(
          c =>
            c.fromNodeId === newConn.fromNodeId &&
            c.toNodeId === newConn.toNodeId &&
            c.fromPort === newConn.fromPort
        );
        if (exists) return prev;
        return {
          ...prev,
          connections: [...prev.connections, newConn],
        };
      });

      setConnectingFrom(null);
    },
    [connectingFrom, updateWorkflowState]
  );

  // Delete Connection
  const handleDeleteConnection = useCallback(
    (connId: string) => {
      updateWorkflowState(prev => ({
        ...prev,
        connections: prev.connections.filter(c => c.id !== connId),
      }));
    },
    [updateWorkflowState]
  );

  // Add node from palette
  const handleAddNode = useCallback(
    (def: NodeDefinition) => {
      const newNode: WorkflowNode = {
        id: `node-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: def.category,
        subType: def.subType,
        name: def.name,
        description: def.description,
        icon: def.icon,
        position: { x: 300 + Math.random() * 80, y: 150 + Math.random() * 80 },
        status: 'idle',
        config: { ...def.defaultConfig },
        ports: def.defaultPorts
          ? {
              inputs: def.defaultPorts.inputs ? [...def.defaultPorts.inputs] : undefined,
              outputs: def.defaultPorts.outputs ? [...def.defaultPorts.outputs] : undefined,
            }
          : undefined,
      };

      updateWorkflowState(prev => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
      }));

      setSelectedNodeId(newNode.id);
      setValidationErrors([]);
      setPaletteOpen(false);
      notify.success({
        title: 'Node Added',
        message: `Added ${def.name} to the workflow canvas.`,
      });
    },
    [updateWorkflowState]
  );

  // Delete Node
  const handleDeleteNode = (nodeId: string) => {
    updateWorkflowState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      connections: prev.connections.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId),
    }));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // Simulated node output generator supporting all 53 nodes
  const generateNodeOutput = useCallback((node: WorkflowNode, inputData: any) => {
    const cfg = node.config || {};
    switch (node.subType) {
      case 'ai_decision_maker':
        return {
          model: cfg.model || 'gpt-4o',
          evaluatedCondition: 'Urgent priority detected from incoming payload',
          selectedBranch: 'branch-1',
          branchLabel: 'Urgent Action',
          confidence: 0.97,
          routingSummary: 'Routed payload directly to immediate response path.',
        };
      case 'multi_agent_coordinator':
        return {
          mode: cfg.executionMode || 'sequential',
          agentsCompleted: 3,
          agentOutputs: {
            researcher: 'Identified 4 key dependency vulnerabilities and CVE references.',
            analyst: 'Confirmed severity score 8.2 and zero-day exposure risk.',
            synthesizer: 'Drafted mitigation plan and verified backup cluster health.',
          },
          consolidatedBrief: 'All 3 agents aligned on immediate automated patch deployment.',
        };
      case 'human_approval':
        return {
          approver: cfg.approverEmail || 'team-lead@company.com',
          status: 'approved',
          decision: 'Approved by authorized operator',
          approvalTimestamp: new Date().toISOString(),
          notes: 'Signed off with zero rollback objections.',
        };
      case 'browser_automation':
        return {
          targetUrl: cfg.targetUrl || 'https://docs.nexio.dev',
          pageTitle: 'Nexio Documentation - Automation Platform',
          httpStatus: 200,
          elementsExtractedCount: 14,
          screenshotCaptured: cfg.captureScreenshot !== false,
          screenshotUri: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          scrapedTextSnippet: 'Enterprise AI workflows with high throughput execution.',
        };
      case 'prompt_optimizer':
        return {
          strategy: cfg.strategy || 'chain_of_thought',
          originalLength: (cfg.inputPrompt || '').length,
          optimizedPrompt: `Think step-by-step to analyze: ${cfg.inputPrompt || 'User Task'}\n1. Identify core constraints.\n2. Verify system state.\n3. Formulate structured response.`,
          estimatedTokenReduction: '18%',
          clarityScore: 9.8,
        };
      case 'graphql_request':
        return {
          endpoint: cfg.endpoint,
          data: {
            repository: {
              stargazerCount: 14820,
              forkCount: 2310,
              openIssues: { totalCount: 12 },
            },
          },
          extensions: { durationMs: 14 },
        };
      case 'xml_parser':
        return {
          parsedTag: cfg.targetTag || 'item',
          elementsCount: 8,
          items: [
            { id: 'xml-1', title: 'Daily Security Advisory', pubDate: '2026-11-01' },
            { id: 'xml-2', title: 'Cluster Performance Metrics', pubDate: '2026-11-01' },
          ],
        };
      case 'csv_processor':
        return {
          operation: cfg.operation || 'csv_to_json',
          rowsProcessed: 142,
          columnsDetected: ['id', 'name', 'email', 'score'],
          recordsSample: [
            { id: '101', name: 'Alice Chen', email: 'alice@company.com', score: '98' },
            { id: '102', name: 'Bob Smith', email: 'bob@company.com', score: '84' },
          ],
        };
      case 'html_extractor':
        return {
          cssSelector: cfg.cssSelector || 'h1, h2, a',
          matchesCount: 12,
          extractedData: [
            { tag: 'H1', text: 'Nexio System Status' },
            { tag: 'A', href: '/dashboard', text: 'View Dashboard' },
          ],
        };
      case 'regex_extractor':
        return {
          pattern: cfg.pattern || '([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+)',
          matchesFound: 3,
          matches: ['admin@nexio.dev', 'ops@nexio.dev', 'support@nexio.dev'],
          transformedString: '[MASKED_EMAIL] verified in audit log.',
        };
      case 'data_transformer':
        return {
          transformedCount: 1,
          outputObject: {
            id: 'item-101',
            firstName: 'System',
            email: 'bot@nexio.internal',
            normalizedAt: Date.now(),
          },
        };
      case 'deduplication':
        return {
          totalInputs: 100,
          duplicatesRemoved: 14,
          uniqueRecordsCount: 86,
          keyFieldsUsed: cfg.keyFields || 'id, email',
        };
      case 'rate_limiter':
        return {
          rateStatus: 'admitted',
          tokensRemaining: 28,
          maxBurst: cfg.maxRequests || 30,
          windowSeconds: cfg.timeWindowSeconds || 60,
        };
      case 'parallel_execution':
        return {
          strategy: cfg.completionStrategy || 'wait_all',
          activeBranches: 3,
          resultsConsolidated: true,
          branch1Data: { task: 'Fetch DB rows', status: 'ok' },
          branch2Data: { task: 'Invoke Vector Search', status: 'ok' },
          branch3Data: { task: 'Verify Authorization', status: 'ok' },
        };
      case 'sub_workflow':
        return {
          executedWorkflowId: cfg.targetWorkflowId || 'wf-doc-ai-summarizer',
          status: 'completed',
          subWorkflowExecutionTimeMs: 412,
          returnedPayload: { summary: 'Sub-workflow executed successfully with clean outputs.' },
        };
      case 'wait_for_event':
        return {
          eventType: cfg.eventType || 'payment.completed',
          eventStatus: 'received',
          eventPayload: { eventId: 'evt-9912', timestamp: Date.now(), matched: true },
        };
      case 'retry_backoff':
        return {
          status: 'succeeded_on_first_try',
          retriesAttempted: 0,
          maxConfiguredRetries: cfg.maxRetries || 4,
          elapsedDelayMs: 0,
        };
      case 'workflow_cancel':
        return {
          action: 'workflow_terminated',
          reason: cfg.cancelReason || 'Workflow cancelled per design rule',
          cleanupHandlersExecuted: 2,
          terminatedAt: new Date().toISOString(),
        };
      case 'smart_scheduler':
        return {
          scheduleType: cfg.scheduleType || 'business_hours',
          timezone: cfg.timezone || 'America/New_York',
          businessHoursVerified: true,
          currentExecutionTime: new Date().toISOString(),
        };
      case 'execution_logger':
        return {
          loggedAt: new Date().toISOString(),
          logLevel: cfg.logLevel || 'info',
          sensitiveFieldsMaskedCount: 3,
          auditRecordId: `audit-${Date.now()}`,
          telemetryStatus: 'indexed',
        };
      case 'http_request':
        return {
          status: 200,
          statusText: 'OK',
          method: cfg.method || 'POST',
          url: cfg.url,
          responseHeaders: { 'content-type': 'application/json', 'x-request-id': 'req-98231' },
          data: {
            success: true,
            message: 'External REST API endpoint executed successfully',
            timestamp: Date.now(),
          },
        };
      case 'switch_router':
        return {
          evaluatedField: cfg.property || 'status',
          selectedBranch: 'branch-1',
          branchLabel: 'Branch 1 (Approved)',
          valueMatched: cfg.route1Value || 'approved',
        };
      case 'loop_iterator':
        return {
          arrayField: cfg.fieldPath || 'items',
          totalItems: 12,
          batchSize: cfg.batchSize || 5,
          iterationsCompleted: 3,
          sampleItem: { id: 'item-101', status: 'processed' },
        };
      case 'error_handler':
        return {
          status: 'protected',
          retriesConfigured: cfg.retryAttempts || 3,
          retriesUsed: 0,
          caughtErrorsCount: 0,
          activePath: 'success',
        };
      case 'json_parser':
        return {
          mode: cfg.mode || 'parse',
          jsonPath: cfg.jsonPath || '$.items[*].name',
          extractedCount: 2,
          result: ['Q3 Financial Review', 'Customer Feedback Logs'],
        };
      case 'merge_node':
        return {
          mode: cfg.mode || 'wait_all',
          upstreamBranchesCount: 2,
          synchronized: true,
          consolidatedKey: cfg.outputKey || 'merged_results',
        };
      case 'filter_node':
        return {
          fieldEvaluated: cfg.field || 'score',
          operator: cfg.operator || 'greater_than',
          threshold: cfg.value || '80',
          passedCount: 1,
          matchedRecords: [{ id: 'item-101', score: 92 }],
        };
      case 'variable_node':
        return {
          operation: cfg.operation || 'set',
          variable: cfg.variableName || 'userSummary',
          value: 'Saved in workflow session memory',
          storedAt: Date.now(),
        };
      case 'ai_memory':
        return {
          memoryType: cfg.memoryType || 'window_buffer',
          sessionId: 'default-session',
          tokensInBuffer: 418,
          messagesStored: 6,
        };
      case 'ai_classifier':
        return {
          model: cfg.model || 'gpt-4o-mini',
          classification: 'Urgent',
          confidence: 0.96,
          candidateLabels: (cfg.categories || 'Urgent, Bug, Feedback').split(',').map((s: string) => s.trim()),
        };
      case 'embeddings_generator':
        return {
          model: cfg.model || 'text-embedding-3-small',
          vectorDimensions: cfg.dimensions || 1536,
          vectorPreview: [0.0142, -0.0512, 0.0894, -0.0021, 0.0381],
        };
      case 'vector_search':
        return {
          knowledgeBase: cfg.knowledgeBase || 'nexio-docs-kb',
          topK: cfg.topK || 5,
          retrievedMatches: [
            { docTitle: 'Engineering System Architecture', similarity: 0.94 },
            { docTitle: 'Automation Node Specifications', similarity: 0.89 },
          ],
        };
      case 'image_analyzer':
        return {
          model: cfg.model || 'gpt-4o',
          objectsDetected: ['Workflow Canvas', 'UI Components', 'Data Flow Cable'],
          ocrText: 'Nexio Automation v2.0 Platform',
          confidence: 0.98,
        };
      case 'speech_to_text':
        return {
          model: 'whisper-large-v3',
          transcript: 'Create an automated database query workflow that triggers every Monday at 9 AM.',
          language: 'en',
          durationSeconds: 4.8,
        };
      case 'text_to_speech':
        return {
          provider: cfg.provider || 'elevenlabs',
          voice: cfg.voice || 'Adam',
          audioUrl: 'blob:nexio-tts-preview-sample.mp3',
          durationSeconds: 5.4,
        };
      case 'database_query':
        return {
          engine: cfg.engine || 'postgresql',
          rowsReturned: 18,
          durationMs: 14,
          recordsSample: [
            { id: 1, title: 'Project Roadmap 2026', status: 'active' },
            { id: 2, title: 'AI Automation Spec', status: 'active' },
          ],
        };
      case 'send_email':
        return {
          service: cfg.service || 'gmail',
          recipient: cfg.to || 'team@nexio.internal',
          status: 'delivered',
          messageId: `msg-${Date.now()}`,
        };
      case 'notification':
        return {
          platform: cfg.platform || 'slack',
          target: cfg.recipient || '#alerts',
          status: 'posted_successfully',
          timestamp: Date.now(),
        };
      case 'file_storage':
        return {
          action: cfg.action || 'upload',
          provider: cfg.provider || 's3',
          bucket: cfg.bucket || 'nexio-workflow-assets',
          fileKey: cfg.fileKey || 'exports/report.json',
          sizeBytes: 4096,
          publicUrl: `https://storage.nexio.internal/${cfg.fileKey || 'exports/report.json'}`,
        };
      case 'webhook_response':
        return {
          httpStatusCode: cfg.statusCode || 200,
          headersSent: { 'content-type': 'application/json' },
          responsePayload: { success: true, timestamp: Date.now() },
        };
      case 'llm_chat':
        return {
          model: cfg.model || 'gpt-4o',
          output:
            '### AI Executive Synthesis\n- Processed input data and extracted core insights.\n- Successfully validated all downstream schema constraints.\n- Prepared structured payload for publishing.',
        };
      case 'ai_agent':
        return {
          model: cfg.model || 'claude-3-5-sonnet',
          stepsTaken: 4,
          toolsInvoked: ['web_search', 'rag_retrieval'],
          executiveSummary: 'Deep research completed with verified citations and structured action items.',
        };
      case 'summarizer':
        return {
          format: cfg.format || 'bullet-points',
          bulletPoints: [
            'High throughput automation confirmed with low latency.',
            'All database queries indexed and optimized.',
            'Security boundaries enforced across external API boundaries.',
          ],
        };
      case 'fal_image':
        return {
          model: cfg.model || 'flux-schnell',
          imageUrl:
            'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800',
          aspectRatio: cfg.aspectRatio || '16:9',
        };
      case 'condition':
        return {
          fieldEvaluated: cfg.field || 'status',
          result: true,
          branch: 'true',
        };
      case 'code':
        return {
          executed: true,
          transformedPayload: { ...inputData, processedAt: Date.now(), valid: true },
        };
      case 'delay':
        return {
          waitedSeconds: cfg.durationSeconds || 5,
          resumedAt: Date.now(),
        };
      case 'create_doc':
        return {
          docId: `doc-${Date.now()}`,
          docTitle: cfg.docTitle || 'Automated Nexio Doc',
          mode: cfg.mode || 'page',
          status: 'published',
        };
      case 'slack_message':
        return {
          channel: cfg.channel || '#general',
          delivered: true,
          timestamp: Date.now(),
        };
      default:
        return {
          node: node.name,
          subType: node.subType,
          output: 'Executed successfully with zero errors',
          timestamp: Date.now(),
        };
    }
  }, []);

  // Execution engine simulation with comprehensive node support, credential masking & live logs
  const handleExecute = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setLogsOpen(true);
    setExecutionLogs([]);
    setPendingApproval(null);

    // Reset node statuses
    updateWorkflowState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => ({
        ...n,
        status: 'idle',
        outputData: undefined,
        error: undefined,
      })),
    }));

    const addLog = (nodeName: string, status: string, data: any) => {
      setExecutionLogs(logs => [
        ...logs,
        {
          timestamp: new Date().toLocaleTimeString(),
          nodeName,
          status,
          data: sanitizeForLogging(data),
        },
      ]);
    };

    // Find trigger nodes or in-degree 0 nodes
    const triggerNodes = workflow.nodes.filter(n => n.type === 'trigger');
    const startNodes =
      triggerNodes.length > 0
        ? triggerNodes
        : workflow.nodes.filter(n => !workflow.connections.some(c => c.toNodeId === n.id));
    const initialQueueNodes = startNodes.length > 0 ? startNodes : [workflow.nodes[0]];

    const executedNodeIds = new Set<string>();
    const nodeOutputMap = new Map<string, any>();

    let currentPayload: any = {
      triggeredAt: new Date().toISOString(),
      workspace: 'current',
      items: [
        { id: 'item-101', title: 'Q3 Financial Review', score: 92, status: 'approved' },
        { id: 'item-102', title: 'Customer Feedback Logs', score: 65, status: 'pending' },
      ],
    };

    // Process nodes step-by-step
    const executionQueue: WorkflowNode[] = [...initialQueueNodes];

    while (executionQueue.length > 0) {
      const node = executionQueue.shift();
      if (!node || executedNodeIds.has(node.id)) continue;

      executedNodeIds.add(node.id);

      // Check for Workflow Cancel node
      if (node.subType === 'workflow_cancel') {
        updateWorkflowState(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => (n.id === node.id ? { ...n, status: 'running' } : n)),
        }));
        await new Promise(r => setTimeout(r, 400));
        const cancelOutput = generateNodeOutput(node, currentPayload);
        updateWorkflowState(prev => ({
          ...prev,
          nodes: prev.nodes.map(n =>
            n.id === node.id ? { ...n, status: 'success', outputData: cancelOutput } : n
          ),
        }));
        addLog(node.name, 'Workflow Cancelled', cancelOutput);
        notify.warning({
          title: 'Workflow Execution Halted',
          message: cancelOutput.reason || 'Workflow cancelled per design rule.',
        });
        break;
      }

      // Handle Human Approval interaction
      if (node.subType === 'human_approval') {
        updateWorkflowState(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => (n.id === node.id ? { ...n, status: 'waiting_approval' } : n)),
        }));

        addLog(node.name, 'Waiting for Human Approval', {
          title: node.config.approvalTitle || 'Manual Sign-off Required',
          approver: node.config.approverEmail || 'admin@company.com',
          status: 'pending_user_decision',
        });

        // Wait for human decision via promise
        const decision: 'approved' | 'rejected' | 'changes_requested' = await new Promise(resolve => {
          setPendingApproval({ node, resolve });
        });

        setPendingApproval(null);

        const approvalOutput = {
          decision,
          status: decision === 'approved' ? 'Approved' : decision === 'rejected' ? 'Rejected' : 'Changes Requested',
          resolvedAt: new Date().toISOString(),
        };

        updateWorkflowState(prev => ({
          ...prev,
          nodes: prev.nodes.map(n =>
            n.id === node.id ? { ...n, status: decision === 'approved' ? 'success' : 'error', outputData: approvalOutput } : n
          ),
        }));

        addLog(node.name, decision === 'approved' ? 'Success (Approved)' : 'Rejected by User', approvalOutput);

        if (decision !== 'approved') {
          // Route along rejected or changes_requested branch
          const branchPort = decision === 'rejected' ? 'rejected' : 'changes_requested';
          const branchConns = workflow.connections.filter(c => c.fromNodeId === node.id && c.fromPort === branchPort);
          for (const conn of branchConns) {
            const nextNode = workflow.nodes.find(n => n.id === conn.toNodeId);
            if (nextNode && !executedNodeIds.has(nextNode.id)) {
              executionQueue.push(nextNode);
            }
          }
          continue;
        }
      } else {
        // Standard node running state
        updateWorkflowState(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => (n.id === node.id ? { ...n, status: 'running' } : n)),
        }));

        await new Promise(r => setTimeout(r, 600));

        const nodeOutput = generateNodeOutput(node, currentPayload);
        nodeOutputMap.set(node.id, nodeOutput);
        currentPayload = { ...currentPayload, [node.name]: nodeOutput, lastOutput: nodeOutput };

        // Set node success
        updateWorkflowState(prev => ({
          ...prev,
          nodes: prev.nodes.map(n =>
            n.id === node.id ? { ...n, status: 'success', outputData: nodeOutput } : n
          ),
        }));

        addLog(node.name, 'Success', nodeOutput);
      }

      // Route along downstream connections
      const outgoingConns = workflow.connections.filter(c => c.fromNodeId === node.id);
      for (const conn of outgoingConns) {
        if (node.subType === 'ai_decision_maker' && conn.fromPort !== 'branch-1' && conn.fromPort !== 'default') {
          continue;
        }
        if (node.subType === 'switch_router' && conn.fromPort !== 'branch-1' && conn.fromPort !== 'default') {
          continue;
        }
        if (node.subType === 'error_handler' && conn.fromPort === 'catch') {
          continue;
        }
        if (node.subType === 'retry_backoff' && conn.fromPort === 'exhausted') {
          continue;
        }
        if (node.subType === 'wait_for_event' && conn.fromPort === 'timeout') {
          continue;
        }
        if (node.subType === 'condition' && conn.fromPort === 'false') {
          continue;
        }

        const nextNode = workflow.nodes.find(n => n.id === conn.toNodeId);
        if (nextNode && !executedNodeIds.has(nextNode.id)) {
          executionQueue.push(nextNode);
        }
      }
    }

    setIsExecuting(false);
    updateWorkflowState(prev => ({
      ...prev,
      lastRunAt: Date.now(),
      lastRunStatus: 'success',
      executionCount: (prev.executionCount || 0) + 1,
    }));

    notify.success({
      title: 'Workflow Execution Finished',
      message: `All ${executedNodeIds.size} automation nodes executed successfully with zero errors.`,
    });
  };

  // Test single node execution directly from configuration panel
  const handleTestSingleNode = () => {
    if (!selectedNode) return;
    const errors = validateNodeConfig(selectedNode);
    if (errors.length > 0) {
      setValidationErrors(errors);
      notify.error({
        title: 'Validation Failed',
        message: errors[0].message,
      });
      return;
    }

    const testOutput = generateNodeOutput(selectedNode, { sample: 'Test context payload' });
    updateWorkflowState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n =>
        n.id === selectedNode.id ? { ...n, status: 'success', outputData: testOutput } : n
      ),
    }));

    notify.success({
      title: 'Test Succeeded',
      message: `Generated simulated response for "${selectedNode.name}". Check the output preview below.`,
    });
  };

  const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId);
  const selectedNodeDef = selectedNode
    ? NODE_CATALOG.find(d => d.subType === selectedNode.subType)
    : undefined;

  // Save Node Configuration handler
  const handleSaveConfig = () => {
    if (!selectedNode) return;
    const errors = validateNodeConfig(selectedNode);
    if (errors.length > 0) {
      setValidationErrors(errors);
      notify.error({
        title: 'Validation Error',
        message: errors[0].message,
      });
      return;
    }

    setValidationErrors([]);
    notify.success({
      title: 'Configuration Saved',
      message: `Settings for "${selectedNode.name}" saved successfully.`,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        position: 'relative',
        backgroundColor: 'var(--affine-background-primary-color)',
        color: 'var(--affine-text-primary-color)',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes pulseFlow {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes subtleGlow {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
        @keyframes approvalPulse {
          0%, 100% { box-shadow: 0 0 14px rgba(245, 158, 11, 0.4); }
          50% { box-shadow: 0 0 24px rgba(245, 158, 11, 0.8); }
        }
      `}</style>

      {/* Top Builder Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid var(--affine-border-color)',
          backgroundColor: 'var(--affine-background-primary-color)',
          zIndex: 10,
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <IconButton size="20" onClick={onBack} tooltip="Back to All Workflows">
            <ArrowLeftBigIcon />
          </IconButton>
          <div>
            <input
              type="text"
              value={workflow.name}
              onChange={e => {
                const newName = e.target.value;
                updateWorkflowState(prev => ({ ...prev, name: newName }));
              }}
              style={{
                fontSize: '16px',
                fontWeight: 600,
                border: 'none',
                background: 'transparent',
                color: 'var(--affine-text-primary-color)',
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '11px', color: 'var(--affine-text-secondary-color)' }}>
              {workflow.nodes.length} nodes · {workflow.connections.length} connections ·{' '}
              {workflow.executionCount || 0} executions
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '20px',
              backgroundColor: 'var(--affine-background-secondary-color)',
              border: '1px solid var(--affine-border-color)',
              fontSize: '12px',
            }}
          >
            <span style={{ color: 'var(--affine-text-secondary-color)' }}>Active</span>
            <Switch
              checked={workflow.active}
              onChange={checked => {
                updateWorkflowState(prev => ({ ...prev, active: checked }));
                notify.success({
                  title: checked ? 'Workflow Activated' : 'Workflow Paused',
                  message: checked
                    ? 'Automation is live and will respond to triggers.'
                    : 'Automation paused.',
                });
              }}
            />
          </div>

          <Button
            variant="secondary"
            prefix={<PlusIcon />}
            onClick={() => {
              setSearchQuery('');
              setSelectedCategory('all');
              setPaletteOpen(true);
            }}
          >
            Add Node
          </Button>

          <Button
            variant="primary"
            loading={isExecuting}
            onClick={handleExecute}
            style={{
              background: 'linear-gradient(135deg, #2563eb, #3b82f6)',
              color: '#fff',
              border: 'none',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
            }}
          >
            {isExecuting ? 'Executing Workflow...' : 'Execute Workflow'}
          </Button>
        </div>
      </div>

      {/* Main Interactive Canvas */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onClick={() => {
          setSelectedNodeId(null);
          setValidationErrors([]);
        }}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--affine-background-secondary-color)',
          backgroundImage:
            'radial-gradient(var(--affine-border-color, rgba(0, 0, 0, 0.15)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          cursor: draggingNode ? 'grabbing' : 'default',
        }}
      >
        {/* SVG Bezier Connection Cables */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <defs>
            <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Existing connections */}
          {workflow.connections.map(conn => {
            const fromNode = workflow.nodes.find(n => n.id === conn.fromNodeId);
            const toNode = workflow.nodes.find(n => n.id === conn.toNodeId);
            if (!fromNode || !toNode) return null;

            // Calculate exact output port Y offset based on port index
            const outPorts = fromNode.ports?.outputs || [{ id: 'output', label: 'Out' }];
            const portIdx = outPorts.findIndex(p => p.id === conn.fromPort);
            const totalOut = outPorts.length;
            const outY =
              totalOut > 1 && portIdx >= 0 ? 24 + portIdx * (50 / (totalOut - 1)) + 6 : 42;

            const x1 = fromNode.position.x + 230;
            const y1 = fromNode.position.y + outY;
            const x2 = toNode.position.x;
            const y2 = toNode.position.y + 42;

            const dx = Math.max(Math.abs(x2 - x1) / 2, 40);
            const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

            const isFlowing =
              isExecuting && (fromNode.status === 'success' || fromNode.status === 'running');

            return (
              <g key={conn.id} style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                  onClick={() => handleDeleteConnection(conn.id)}
                />
                <path
                  d={pathD}
                  fill="none"
                  stroke={isFlowing ? 'url(#activeGradient)' : 'var(--affine-border-color, #94a3b8)'}
                  strokeWidth={isFlowing ? '3' : '2'}
                  strokeDasharray={isFlowing ? '6,6' : 'none'}
                  style={{
                    animation: isFlowing ? 'pulseFlow 1s linear infinite' : 'none',
                    transition: 'stroke 0.3s ease',
                  }}
                />
              </g>
            );
          })}

          {/* Pending connection being dragged */}
          {connectingFrom && (
            <path
              d={`M ${connectingFrom.x} ${connectingFrom.y} C ${connectingFrom.x + 60} ${connectingFrom.y}, ${
                mousePos.x - 60
              } ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeDasharray="4,4"
            />
          )}
        </svg>

        {/* Nodes Render */}
        {workflow.nodes.map(node => {
          const isSelected = selectedNodeId === node.id;
          const colors = CATEGORY_COLORS[node.type] || CATEGORY_COLORS.action;
          const isRunning = node.status === 'running';
          const isSuccess = node.status === 'success';
          const isError = node.status === 'error';
          const isWaitingApproval = node.status === 'waiting_approval';

          // Node ports
          const outputPorts: WorkflowPort[] =
            node.ports?.outputs && node.ports.outputs.length > 0
              ? node.ports.outputs
              : node.subType === 'workflow_cancel'
                ? []
                : [{ id: 'output', label: 'Out' }];

          const def = NODE_CATALOG.find(d => d.subType === node.subType);
          const iconToUse = node.icon || def?.icon || (node.type === 'trigger' ? '⚡' : '⚙️');

          return (
            <div
              key={node.id}
              onMouseDown={e => handleNodeMouseDown(e, node)}
              onClick={e => {
                e.stopPropagation();
                setSelectedNodeId(node.id);
                setValidationErrors([]);
              }}
              style={{
                position: 'absolute',
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                width: '230px',
                backgroundColor: 'var(--affine-background-primary-color)',
                borderRadius: '12px',
                border: isSelected
                  ? '2px solid #3b82f6'
                  : isRunning
                    ? '2px solid #ec4899'
                    : isWaitingApproval
                      ? '2px solid #f59e0b'
                      : isSuccess
                        ? '2px solid #10b981'
                        : isError
                          ? '2px solid #ef4444'
                          : '1px solid var(--affine-border-color)',
                boxShadow: isSelected
                  ? '0 8px 24px rgba(59, 130, 246, 0.25)'
                  : isRunning
                    ? '0 8px 24px rgba(236, 72, 153, 0.25)'
                    : isWaitingApproval
                      ? '0 0 16px rgba(245, 158, 11, 0.45)'
                      : '0 4px 14px rgba(0, 0, 0, 0.08)',
                zIndex: isSelected ? 5 : 2,
                cursor: 'grab',
                transition: 'border 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Input Port (Left Handle) */}
              {node.type !== 'trigger' && (
                <div
                  className="port-handle"
                  onMouseUp={e => handleEndConnect(e, node.id, 'input')}
                  title="Connect Input"
                  style={{
                    position: 'absolute',
                    left: '-7px',
                    top: '36px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    border: '3px solid #3b82f6',
                    cursor: 'crosshair',
                    boxShadow: '0 0 6px rgba(59, 130, 246, 0.5)',
                    zIndex: 10,
                  }}
                />
              )}

              {/* Node Card Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px 6px',
                  borderBottom: '1px solid var(--affine-border-color)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    fontSize: '15px',
                    flexShrink: 0,
                  }}
                >
                  {iconToUse}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {node.name}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: colors.text,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: '0.4px',
                    }}
                  >
                    {node.type}
                  </div>
                </div>

                {/* Status Indicator */}
                {isRunning && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ec4899',
                      boxShadow: '0 0 8px #ec4899',
                    }}
                  />
                )}
                {isWaitingApproval && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#f59e0b',
                      boxShadow: '0 0 8px #f59e0b',
                      animation: 'subtleGlow 0.8s infinite',
                    }}
                  />
                )}
                {isSuccess && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      boxShadow: '0 0 8px #10b981',
                    }}
                  />
                )}
                {isError && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ef4444',
                      boxShadow: '0 0 8px #ef4444',
                    }}
                  />
                )}
              </div>

              {/* Node Card Body */}
              <div
                style={{
                  padding: '8px 12px 10px',
                  fontSize: '11px',
                  color: 'var(--affine-text-secondary-color)',
                  lineHeight: '1.4',
                }}
              >
                {node.description}
              </div>

              {/* Output Ports (Right Handles) */}
              {outputPorts.map((port, idx) => {
                const total = outputPorts.length;
                const topPos = total === 1 ? 36 : 18 + idx * (46 / Math.max(1, total - 1));
                const portColor = port.color || '#ec4899';

                return (
                  <div
                    key={port.id}
                    className="port-handle"
                    onMouseDown={e => handleStartConnect(e, node.id, port.id)}
                    title={`Output: ${port.label}`}
                    style={{
                      position: 'absolute',
                      right: '-7px',
                      top: `${topPos}px`,
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      backgroundColor: '#fff',
                      border: `3px solid ${portColor}`,
                      cursor: 'crosshair',
                      boxShadow: `0 0 6px ${portColor}`,
                      zIndex: 10,
                    }}
                  />
                );
              })}
            </div>
          );
        })}

        {/* Node Configuration Drawer (Right Side) */}
        {selectedNode && (
          <div
            onClick={e => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '360px',
              height: '100%',
              backgroundColor: 'var(--affine-background-primary-color)',
              borderLeft: '1px solid var(--affine-border-color)',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderBottom: '1px solid var(--affine-border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor:
                      CATEGORY_COLORS[selectedNode.type]?.bg || 'rgba(59, 130, 246, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '18px',
                  }}
                >
                  {selectedNode.icon || selectedNodeDef?.icon || '⚙️'}
                </div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Configure Node</div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: CATEGORY_COLORS[selectedNode.type]?.text || '#3b82f6',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                    }}
                  >
                    {selectedNode.subType.replace(/_/g, ' ')}
                  </div>
                </div>
              </div>
              <IconButton size="20" onClick={() => setSelectedNodeId(null)}>
                <CloseIcon />
              </IconButton>
            </div>

            {/* Drawer Body Scroll */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {/* Validation Errors Alert */}
              {validationErrors.length > 0 && (
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    fontSize: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ fontWeight: 600 }}>⚠️ Validation Errors:</div>
                  {validationErrors.map((err, i) => (
                    <div key={i}>• {err.message}</div>
                  ))}
                </div>
              )}

              {/* Node Name */}
              <div>
                <label
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--affine-text-secondary-color)',
                    display: 'block',
                    marginBottom: '6px',
                  }}
                >
                  Node Title
                </label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={e => {
                    const name = e.target.value;
                    updateWorkflowState(prev => ({
                      ...prev,
                      nodes: prev.nodes.map(n => (n.id === selectedNode.id ? { ...n, name } : n)),
                    }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--affine-border-color)',
                    backgroundColor: 'var(--affine-background-secondary-color)',
                    color: 'var(--affine-text-primary-color)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Node Description Display */}
              <div
                style={{
                  fontSize: '11px',
                  color: 'var(--affine-text-secondary-color)',
                  backgroundColor: 'var(--affine-background-secondary-color)',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  border: '1px solid var(--affine-border-color)',
                  lineHeight: '1.4',
                }}
              >
                {selectedNode.description}
              </div>

              {/* Dynamic Parameter Forms Tailored to Node Subtypes */}

              {/* AI Decision Maker */}
              {selectedNode.subType === 'ai_decision_maker' && (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      AI Evaluation Model
                    </label>
                    <select
                      value={selectedNode.config.model || 'gpt-4o'}
                      onChange={e => {
                        const model = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, model } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    >
                      <option value="gpt-4o">OpenAI GPT-4o</option>
                      <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Decision Criteria Prompt
                    </label>
                    <textarea
                      rows={3}
                      value={selectedNode.config.decisionPrompt || ''}
                      onChange={e => {
                        const decisionPrompt = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, decisionPrompt } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    />
                  </div>
                </>
              )}

              {/* Multi-Agent Coordinator */}
              {selectedNode.subType === 'multi_agent_coordinator' && (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Coordination Mode
                    </label>
                    <select
                      value={selectedNode.config.executionMode || 'sequential'}
                      onChange={e => {
                        const executionMode = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, executionMode } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    >
                      <option value="sequential">Sequential Pipeline (A -&gt; B -&gt; C)</option>
                      <option value="parallel">Parallel Consensus (A + B + C)</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Agent Team Roles &amp; Models
                    </label>
                    <textarea
                      rows={3}
                      value={selectedNode.config.roles || ''}
                      onChange={e => {
                        const roles = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, roles } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    />
                  </div>
                </>
              )}

              {/* Human Approval */}
              {selectedNode.subType === 'human_approval' && (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Approver Email
                    </label>
                    <input
                      type="text"
                      placeholder="approver@company.com"
                      value={selectedNode.config.approverEmail || ''}
                      onChange={e => {
                        const approverEmail = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, approverEmail } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Approval Request Title
                    </label>
                    <input
                      type="text"
                      placeholder="Approve Production Deploy"
                      value={selectedNode.config.approvalTitle || ''}
                      onChange={e => {
                        const approvalTitle = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, approvalTitle } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Timeout (Minutes)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={1440}
                      value={selectedNode.config.timeoutMinutes || 60}
                      onChange={e => {
                        const timeoutMinutes = parseInt(e.target.value, 10) || 60;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, timeoutMinutes } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    />
                  </div>
                </>
              )}

              {/* Browser Automation */}
              {selectedNode.subType === 'browser_automation' && (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Browser Action
                    </label>
                    <select
                      value={selectedNode.config.action || 'scrape_page'}
                      onChange={e => {
                        const action = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, action } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    >
                      <option value="scrape_page">Scrape HTML &amp; Text</option>
                      <option value="screenshot">Capture Page Screenshot</option>
                      <option value="click_and_fill">Fill Forms &amp; Click</option>
                      <option value="pdf_export">Export PDF</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Target Website URL
                    </label>
                    <input
                      type="text"
                      placeholder="https://example.com"
                      value={selectedNode.config.targetUrl || ''}
                      onChange={e => {
                        const targetUrl = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, targetUrl } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      CSS Target Selector
                    </label>
                    <input
                      type="text"
                      placeholder="article.content, button#submit"
                      value={selectedNode.config.selector || ''}
                      onChange={e => {
                        const selector = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, selector } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    />
                  </div>
                </>
              )}

              {/* Prompt Optimizer */}
              {selectedNode.subType === 'prompt_optimizer' && (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Optimization Strategy
                    </label>
                    <select
                      value={selectedNode.config.strategy || 'chain_of_thought'}
                      onChange={e => {
                        const strategy = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, strategy } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    >
                      <option value="chain_of_thought">Chain-of-Thought (Step-by-step reasoning)</option>
                      <option value="few_shot">Few-Shot Exemplar Augmentation</option>
                      <option value="clarity_and_brevity">Clarity &amp; Token Optimization</option>
                      <option value="safety_guardrail">Safety &amp; Compliance Guardrail</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Raw Prompt Input
                    </label>
                    <textarea
                      rows={3}
                      value={selectedNode.config.inputPrompt || ''}
                      onChange={e => {
                        const inputPrompt = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, inputPrompt } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    />
                  </div>
                </>
              )}

              {/* GraphQL Request */}
              {selectedNode.subType === 'graphql_request' && (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      GraphQL Endpoint
                    </label>
                    <input
                      type="text"
                      placeholder="https://api.github.com/graphql"
                      value={selectedNode.config.endpoint || ''}
                      onChange={e => {
                        const endpoint = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, endpoint } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Query / Mutation
                    </label>
                    <textarea
                      rows={4}
                      value={selectedNode.config.query || ''}
                      onChange={e => {
                        const query = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, query } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '11px', fontFamily: 'monospace' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Auth Token (Bearer)
                    </label>
                    <input
                      type="password"
                      placeholder="Bearer ghp_..."
                      value={selectedNode.config.authToken || ''}
                      onChange={e => {
                        const authToken = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, authToken } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    />
                  </div>
                </>
              )}

              {/* Parallel Execution */}
              {selectedNode.subType === 'parallel_execution' && (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Completion Strategy
                    </label>
                    <select
                      value={selectedNode.config.completionStrategy || 'wait_all'}
                      onChange={e => {
                        const completionStrategy = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, completionStrategy } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    >
                      <option value="wait_all">Wait for All Branches</option>
                      <option value="first_completed">First Completed (Race)</option>
                      <option value="majority">Majority Completed (Quorum)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Sub-workflow */}
              {selectedNode.subType === 'sub_workflow' && (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Target Workflow ID
                    </label>
                    <input
                      type="text"
                      placeholder="wf-doc-ai-summarizer"
                      value={selectedNode.config.targetWorkflowId || ''}
                      onChange={e => {
                        const targetWorkflowId = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, targetWorkflowId } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    />
                  </div>
                </>
              )}

              {/* Retry with Backoff */}
              {selectedNode.subType === 'retry_backoff' && (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Max Retries
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={selectedNode.config.maxRetries || 4}
                      onChange={e => {
                        const maxRetries = parseInt(e.target.value, 10) || 1;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, maxRetries } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    />
                  </div>
                </>
              )}

              {/* Smart Scheduler */}
              {selectedNode.subType === 'smart_scheduler' && (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Timezone
                    </label>
                    <input
                      type="text"
                      placeholder="America/New_York"
                      value={selectedNode.config.timezone || 'America/New_York'}
                      onChange={e => {
                        const timezone = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, timezone } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    />
                  </div>
                </>
              )}

              {/* Execution Logger */}
              {selectedNode.subType === 'execution_logger' && (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Audit Log Level
                    </label>
                    <select
                      value={selectedNode.config.logLevel || 'info'}
                      onChange={e => {
                        const logLevel = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n => n.id === selectedNode.id ? { ...n, config: { ...n.config, logLevel } } : n),
                        }));
                      }}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--affine-border-color)', backgroundColor: 'var(--affine-background-secondary-color)', color: 'var(--affine-text-primary-color)', fontSize: '12px' }}
                    >
                      <option value="debug">DEBUG (Verbose Trace)</option>
                      <option value="info">INFO (Standard Audit)</option>
                      <option value="warn">WARN (Non-critical)</option>
                      <option value="error">ERROR (Failures only)</option>
                    </select>
                  </div>
                </>
              )}

              {/* Connections Overview */}
              <div
                style={{
                  marginTop: '8px',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--affine-border-color)',
                }}
              >
                <div
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--affine-text-secondary-color)',
                    marginBottom: '6px',
                  }}
                >
                  Active Node Connections
                </div>
                <div style={{ fontSize: '11px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div>
                    <span style={{ color: 'var(--affine-text-secondary-color)' }}>Inputs from: </span>
                    {workflow.connections
                      .filter(c => c.toNodeId === selectedNode.id)
                      .map(c => workflow.nodes.find(n => n.id === c.fromNodeId)?.name || c.fromNodeId)
                      .join(', ') || 'None'}
                  </div>
                  <div>
                    <span style={{ color: 'var(--affine-text-secondary-color)' }}>Outputs to: </span>
                    {workflow.connections
                      .filter(c => c.fromNodeId === selectedNode.id)
                      .map(c => workflow.nodes.find(n => n.id === c.toNodeId)?.name || c.toNodeId)
                      .join(', ') || 'None'}
                  </div>
                </div>
              </div>

              {/* Output Preview */}
              {selectedNode.outputData && (
                <div>
                  <label
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#10b981',
                      display: 'block',
                      marginBottom: '6px',
                    }}
                  >
                    ✓ Output Payload Preview
                  </label>
                  <pre
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--affine-background-secondary-color)',
                      fontSize: '10px',
                      maxHeight: '140px',
                      overflowY: 'auto',
                      border: '1px solid var(--affine-border-color)',
                    }}
                  >
                    {JSON.stringify(sanitizeForLogging(selectedNode.outputData), null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Drawer Actions Footer */}
            <div
              style={{
                padding: '16px',
                borderTop: '1px solid var(--affine-border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <Button
                variant="secondary"
                block
                onClick={handleTestSingleNode}
              >
                ⚡ Test Node Execution
              </Button>
              <Button
                variant="primary"
                block
                onClick={handleSaveConfig}
                style={{
                  backgroundColor: '#10b981',
                  color: '#fff',
                  border: 'none',
                }}
              >
                Save Configuration
              </Button>
              <Button
                variant="error"
                block
                prefix={<DeleteIcon />}
                onClick={() => handleDeleteNode(selectedNode.id)}
              >
                Delete Node
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Node Palette Modal */}
      {paletteOpen && (
        <div
          onClick={() => setPaletteOpen(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.55)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '780px',
              maxHeight: '88vh',
              backgroundColor: 'var(--affine-background-primary-color)',
              borderRadius: '16px',
              border: '1px solid var(--affine-border-color)',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--affine-border-color)',
              }}
            >
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>Automation Nodes Catalog</div>
                <div style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)' }}>
                  Explore 50+ enterprise triggers, AI multi-agent orchestrators, and developer tools
                </div>
              </div>
              <IconButton size="20" onClick={() => setPaletteOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>

            {/* Search Bar & Category Filter Tabs */}
            <div
              style={{
                padding: '12px 20px 8px',
                borderBottom: '1px solid var(--affine-border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Search Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: 'var(--affine-background-secondary-color)',
                  borderRadius: '8px',
                  border: '1px solid var(--affine-border-color)',
                  padding: '6px 12px',
                  gap: '8px',
                }}
              >
                <SearchIcon style={{ color: 'var(--affine-text-secondary-color)', fontSize: '16px' }} />
                <input
                  type="text"
                  placeholder="Search all 50+ automation nodes (e.g. Decision Maker, GraphQL, Multi-Agent, Browser, Approval)..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--affine-text-primary-color)',
                    fontSize: '13px',
                    outline: 'none',
                  }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--affine-text-secondary-color)',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  overflowX: 'auto',
                  paddingBottom: '4px',
                }}
              >
                {(
                  [
                    'all',
                    'triggers',
                    'ai_agents',
                    'logic_flow',
                    'data_processing',
                    'developer_tools',
                    'browser_automation',
                    'human_interaction',
                    'monitoring_utilities',
                  ] as FilterCategory[]
                ).map(catKey => {
                  const isActive = selectedCategory === catKey;
                  const count = categoryCounts[catKey] || 0;
                  const item = FILTER_CATEGORY_MAP[catKey];
                  return (
                    <button
                      key={catKey}
                      onClick={() => setSelectedCategory(catKey)}
                      style={{
                        padding: '5px 12px',
                        borderRadius: '16px',
                        border: isActive
                          ? '1px solid #3b82f6'
                          : '1px solid var(--affine-border-color)',
                        backgroundColor: isActive
                          ? 'rgba(59, 130, 246, 0.15)'
                          : 'var(--affine-background-secondary-color)',
                        color: isActive ? '#3b82f6' : 'var(--affine-text-primary-color)',
                        fontSize: '12px',
                        fontWeight: isActive ? 600 : 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <span>{item.label}</span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 5px',
                          borderRadius: '10px',
                          backgroundColor: isActive ? '#3b82f6' : 'var(--affine-border-color)',
                          color: isActive ? '#fff' : 'var(--affine-text-secondary-color)',
                        }}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Catalog Grid */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '16px 20px',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
              }}
            >
              {filteredCatalog.length === 0 ? (
                <div
                  style={{
                    gridColumn: 'span 2',
                    textAlign: 'center',
                    padding: '40px 20px',
                    color: 'var(--affine-text-secondary-color)',
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>No matching nodes found</div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Try clearing your search query or selecting another category filter.
                  </div>
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategory('all');
                    }}
                    style={{
                      marginTop: '12px',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--affine-border-color)',
                      backgroundColor: 'var(--affine-background-secondary-color)',
                      color: 'var(--affine-text-primary-color)',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                  >
                    Clear Filter
                  </button>
                </div>
              ) : (
                filteredCatalog.map(def => {
                  const colors = CATEGORY_COLORS[def.category] || CATEGORY_COLORS.action;
                  return (
                    <div
                      key={def.subType}
                      onClick={() => handleAddNode(def)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        border: '1px solid var(--affine-border-color)',
                        backgroundColor: 'var(--affine-background-secondary-color)',
                        cursor: 'pointer',
                        transition: 'border-color 0.2s, transform 0.15s, box-shadow 0.15s',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.borderColor = colors.text;
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                        (e.currentTarget as HTMLElement).style.boxShadow =
                          '0 6px 18px rgba(0, 0, 0, 0.12)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.borderColor =
                          'var(--affine-border-color)';
                        (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                        (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                      }}
                    >
                      <div
                        style={{
                          width: '38px',
                          height: '38px',
                          borderRadius: '10px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backgroundColor: colors.bg,
                          border: `1px solid ${colors.border}`,
                          fontSize: '19px',
                          flexShrink: 0,
                        }}
                      >
                        {def.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '6px',
                          }}
                        >
                          <div
                            style={{
                              fontSize: '13px',
                              fontWeight: 600,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {def.name}
                          </div>
                          <div
                            style={{
                              fontSize: '9px',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              color: colors.text,
                              backgroundColor: colors.bg,
                              padding: '1px 6px',
                              borderRadius: '4px',
                              letterSpacing: '0.4px',
                            }}
                          >
                            {def.category}
                          </div>
                        </div>
                        <div
                          style={{
                            fontSize: '11px',
                            color: 'var(--affine-text-secondary-color)',
                            marginTop: '4px',
                            lineHeight: '1.35',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                          }}
                        >
                          {def.description}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Execution Logs Drawer (Bottom) */}
      {logsOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '250px',
            backgroundColor: 'var(--affine-background-primary-color)',
            borderTop: '1px solid var(--affine-border-color)',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.15)',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              borderBottom: '1px solid var(--affine-border-color)',
              backgroundColor: 'var(--affine-background-secondary-color)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', fontWeight: 600 }}>
              <span>Live Automation Execution Console</span>
              {isExecuting && (
                <span
                  style={{
                    color: '#ec4899',
                    fontSize: '11px',
                    fontWeight: 500,
                    animation: 'subtleGlow 1s infinite',
                  }}
                >
                  ● Running steps...
                </span>
              )}
            </div>
            <IconButton size="20" onClick={() => setLogsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>

          {/* Interactive Human Approval Banner */}
          {pendingApproval && (
            <div
              style={{
                margin: '8px 12px 0',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: 'rgba(245, 158, 11, 0.12)',
                border: '1px solid #f59e0b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                animation: 'approvalPulse 2s infinite',
              }}
            >
              <div>
                <div style={{ fontWeight: 600, color: '#f59e0b', fontSize: '12px' }}>
                  ⏸️ Action Required: {pendingApproval.node.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--affine-text-secondary-color)' }}>
                  {pendingApproval.node.config.approvalDetails ||
                    'Review the generated context and confirm authorization to continue.'}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="primary"
                  onClick={() => pendingApproval.resolve('approved')}
                  style={{ backgroundColor: '#10b981', color: '#fff', border: 'none' }}
                >
                  ✓ Approve
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => pendingApproval.resolve('changes_requested')}
                >
                  Request Changes
                </Button>
                <Button
                  variant="error"
                  onClick={() => pendingApproval.resolve('rejected')}
                >
                  ✕ Reject
                </Button>
              </div>
            </div>
          )}

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '12px',
              fontFamily: 'monospace',
              fontSize: '11px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
            }}
          >
            {executionLogs.length === 0 ? (
              <div
                style={{
                  color: 'var(--affine-text-secondary-color)',
                  textAlign: 'center',
                  padding: '30px',
                }}
              >
                No execution steps recorded yet. Click &quot;Execute Workflow&quot; in the header above to run your automation.
              </div>
            ) : (
              executionLogs.map((log, index) => (
                <div
                  key={index}
                  style={{
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--affine-background-secondary-color)',
                    border: '1px solid var(--affine-border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: 'var(--affine-text-secondary-color)' }}>
                      [{log.timestamp}]
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--affine-text-primary-color)' }}>
                      {log.nodeName}
                    </span>
                    <span
                      style={{
                        color:
                          log.status.includes('Success') || log.status.includes('Approved')
                            ? '#10b981'
                            : log.status.includes('Waiting')
                              ? '#f59e0b'
                              : '#ef4444',
                        fontWeight: 600,
                      }}
                    >
                      {log.status}
                    </span>
                  </div>
                  <pre
                    style={{
                      margin: 0,
                      color: 'var(--affine-text-secondary-color)',
                      fontSize: '10px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-all',
                    }}
                  >
                    {JSON.stringify(log.data, null, 2)}
                  </pre>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
