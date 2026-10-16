export type SeverityLevel = 'critical' | 'high' | 'medium' | 'low';

export type GapCategory =
  | 'swallowed-error'
  | 'database-operation'
  | 'external-api'
  | 'critical-business-logic'
  | 'complex-function'
  | 'retry-timeout'
  | 'unlogged-error-response';

export type PatchStatus = 'pending' | 'accepted' | 'rejected';

export interface CodeContext {
  beforeLines: string[];
  targetLine: string;
  afterLines: string[];
  startLineNumber: number;
}

export interface LoggingGapFinding {
  id: string;
  fileId: string;
  filePath: string;
  functionName: string;
  lineNumber: number;
  severity: SeverityLevel;
  category: GapCategory;
  categoryLabel: string;
  title: string;
  explanation: string;
  impactRisk: string;
  recommendedLocation: string;
  recommendedCode: string;
  confidenceScore: number; // 0 - 100
  codeContext: CodeContext;
  suggestedPatch: {
    originalCode: string;
    patchedCode: string;
    unifiedDiff: string;
  };
  patchStatus: PatchStatus;
  detectedFramework: string;
  detectedLanguage: string;
}

export interface RepositoryFile {
  id: string;
  path: string;
  name: string;
  language: string;
  content: string;
  lineCount: number;
  sizeBytes: number;
  gapsCount: number;
}

export interface RepositoryScanSummary {
  id: string;
  repositoryName: string;
  repositorySource: 'upload-zip' | 'local-folder' | 'git-url' | 'demo-template';
  sourceUrl?: string;
  scanTimestamp: number;
  primaryLanguage: string;
  detectedLanguages: string[];
  detectedFrameworks: string[];
  detectedLogger: string;
  totalFilesScanned: number;
  totalLinesOfCode: number;
  initialHealthScore: number;
  currentHealthScore: number;
  findings: LoggingGapFinding[];
  severityCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  categoryCounts: Record<GapCategory, number>;
  files: RepositoryFile[];
}

export interface ScanProgressState {
  isScanning: boolean;
  step: 'idle' | 'unpacking' | 'analyzing-ast' | 'detecting-gaps' | 'synthesizing-patches' | 'complete';
  progressPercentage: number;
  currentFileName?: string;
  statusMessage: string;
}
