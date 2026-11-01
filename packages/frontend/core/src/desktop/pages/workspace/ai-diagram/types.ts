export type DiagramType =
  | 'system_architecture'
  | 'cloud_architecture'
  | 'flowchart'
  | 'sequence'
  | 'erd'
  | 'uml_class'
  | 'bpmn'
  | 'network'
  | 'data_flow'
  | 'infrastructure'
  | 'mind_map'
  | 'user_journey';

export type NodeShape =
  | 'rectangle'
  | 'rounded'
  | 'cylinder'
  | 'diamond'
  | 'cloud'
  | 'queue'
  | 'actor'
  | 'hexagon'
  | 'database'
  | 'group';

export type EdgeStyle = 'curved' | 'orthogonal' | 'straight';

export type PortPosition = 'top' | 'right' | 'bottom' | 'left';

export interface ERDColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
}

export interface UMLMember {
  name: string;
  visibility: '+' | '-' | '#';
  type?: string;
}

export interface DiagramNode {
  id: string;
  shape: NodeShape;
  label: string;
  description?: string;
  tech?: string;
  badge?: string;
  icon?: string;
  position: { x: number; y: number };
  width?: number;
  height?: number;
  color?: string;
  bg?: string;
  groupId?: string;
  columns?: ERDColumn[];
  attributes?: UMLMember[];
  methods?: UMLMember[];
  metadata?: Record<string, any>;
}

export interface DiagramEdge {
  id: string;
  fromNodeId: string;
  fromPort?: PortPosition;
  toNodeId: string;
  toPort?: PortPosition;
  label?: string;
  protocol?: string;
  style?: EdgeStyle;
  animated?: boolean;
  color?: string;
  dashed?: boolean;
}

export interface DiagramGroup {
  id: string;
  label: string;
  color?: string;
  bounds: { x: number; y: number; width: number; height: number };
}

export interface DiagramHistoryEntry {
  timestamp: number;
  label: string;
  snapshot: string;
}

export interface DiagramItem {
  id: string;
  title: string;
  description: string;
  diagramType: DiagramType;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups?: DiagramGroup[];
  createdAt: number;
  updatedAt: number;
  version: number;
  history?: DiagramHistoryEntry[];
  tags?: string[];
  isTemplate?: boolean;
}

export interface DiagramTemplate {
  id: string;
  name: string;
  category: string;
  diagramType: DiagramType;
  description: string;
  previewIcon: string;
  nodes: DiagramNode[];
  edges: DiagramEdge[];
  groups?: DiagramGroup[];
}

export interface DiagramChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  actionTaken?: string;
  diffSummary?: string;
}

export type ImportFormat =
  | 'image'
  | 'pdf'
  | 'sql'
  | 'terraform'
  | 'json'
  | 'yaml'
  | 'markdown'
  | 'git_repo';

export interface CodebaseAnalysisResult {
  repoName: string;
  services: Array<{ name: string; path: string; tech: string }>;
  databases: Array<{ name: string; type: string }>;
  endpoints: Array<{ path: string; method: string }>;
  dependencies: Array<{ from: string; to: string; type: string }>;
}

