export type NodeCategory = 'trigger' | 'ai' | 'logic' | 'action';

export type NodeStatus = 'idle' | 'running' | 'success' | 'error';

export interface WorkflowNode {
  id: string;
  type: NodeCategory;
  subType: string;
  name: string;
  description: string;
  position: { x: number; y: number };
  status: NodeStatus;
  config: Record<string, any>;
  outputData?: any;
  error?: string;
}

export interface WorkflowConnection {
  id: string;
  fromNodeId: string;
  fromPort: string;
  toNodeId: string;
  toPort: string;
}

export interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  active: boolean;
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
  createdAt: number;
  updatedAt: number;
  executionCount: number;
  lastRunAt?: number;
  lastRunStatus?: 'success' | 'failed';
}

export interface NodeDefinition {
  subType: string;
  category: NodeCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  defaultConfig: Record<string, any>;
}
