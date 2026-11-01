export type NodeCategory =
  | 'trigger'
  | 'ai'
  | 'logic'
  | 'data'
  | 'developer'
  | 'browser'
  | 'human'
  | 'utility'
  | 'integration'
  | 'action';

export type NodeStatus = 'idle' | 'running' | 'success' | 'error' | 'waiting_approval';

export interface WorkflowPort {
  id: string;
  label: string;
  color?: string;
}

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
  icon?: string;
  ports?: {
    inputs?: WorkflowPort[];
    outputs?: WorkflowPort[];
  };
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
  tags?: string[];
  defaultConfig: Record<string, any>;
  defaultPorts?: {
    inputs?: WorkflowPort[];
    outputs?: WorkflowPort[];
  };
}
