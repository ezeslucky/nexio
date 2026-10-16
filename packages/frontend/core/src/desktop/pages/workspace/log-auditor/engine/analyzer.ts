import type {
  CodeContext,
  GapCategory,
  LoggingGapFinding,
  RepositoryFile,
  RepositoryScanSummary,
  SeverityLevel,
} from '../types';
import { calculateHealthScore, generateUnifiedDiff } from './patcher';

const IGNORED_DIRECTORIES = [
  'node_modules',
  'dist',
  'build',
  'target',
  '.git',
  '.next',
  '.yarn',
  'coverage',
  '.turbo',
  'venv',
  '__pycache__',
];

export function isSourceFile(path: string): boolean {
  const normalized = path.replace(/\\/g, '/');
  for (const dir of IGNORED_DIRECTORIES) {
    if (normalized.includes(`/${dir}/`) || normalized.startsWith(`${dir}/`)) {
      return false;
    }
  }

  const validExts = [
    '.ts',
    '.tsx',
    '.js',
    '.jsx',
    '.py',
    '.go',
    '.rs',
    '.java',
    '.rb',
    '.php',
    '.cs',
  ];
  return validExts.some(ext => normalized.endsWith(ext));
}

export function detectLanguage(path: string): string {
  if (path.endsWith('.ts') || path.endsWith('.tsx')) return 'TypeScript';
  if (path.endsWith('.js') || path.endsWith('.jsx')) return 'JavaScript';
  if (path.endsWith('.py')) return 'Python';
  if (path.endsWith('.go')) return 'Go';
  if (path.endsWith('.rs')) return 'Rust';
  if (path.endsWith('.java')) return 'Java';
  if (path.endsWith('.cs')) return 'C#';
  if (path.endsWith('.php')) return 'PHP';
  return 'Unknown';
}

export function detectFrameworks(files: RepositoryFile[]): string[] {
  const frameworks = new Set<string>();
  const combined = files.map(f => f.content).join('\n');

  if (combined.includes('express') || combined.includes('Request, Response')) frameworks.add('Express');
  if (combined.includes('@nestjs')) frameworks.add('NestJS');
  if (combined.includes('fastapi')) frameworks.add('FastAPI');
  if (combined.includes('prisma')) frameworks.add('Prisma');
  if (combined.includes('sqlalchemy') || combined.includes('session.commit')) frameworks.add('SQLAlchemy');
  if (combined.includes('stripe')) frameworks.add('Stripe SDK');
  if (combined.includes('pino')) frameworks.add('Pino');
  if (combined.includes('winston')) frameworks.add('Winston');
  if (combined.includes('httpx') || combined.includes('axios')) frameworks.add('HTTP Client');

  if (frameworks.size === 0) {
    frameworks.add('Standard Library');
  }

  return Array.from(frameworks);
}

export function detectProjectLogger(files: RepositoryFile[], language: string): string {
  const combined = files.map(f => f.content).join('\n');

  if (combined.includes('logger.info') || combined.includes('logger.error')) return 'logger';
  if (combined.includes('this.logger')) return 'this.logger';
  if (combined.includes('log.info') || combined.includes('log.Error')) return 'log';
  if (combined.includes('logging.getLogger')) return 'logger';
  if (language === 'Python') return 'logging.getLogger(__name__)';
  return 'console';
}

function extractFunctionContext(lines: string[], targetIndex: number): string {
  for (let i = targetIndex; i >= 0; i--) {
    const line = lines[i].trim();
    // TS/JS match
    const fnMatch = line.match(/(?:async\s+)?(?:function\s+([a-zA-Z0-9_$]+)|(?:const|let|var)\s+([a-zA-Z0-9_$]+)\s*=\s*(?:async\s*)?\(|([a-zA-Z0-9_$]+)\s*\([^)]*\)\s*\{)/);
    if (fnMatch) {
      return fnMatch[1] || fnMatch[2] || fnMatch[3] || 'anonymous';
    }
    // Python match
    const pyMatch = line.match(/(?:async\s+)?def\s+([a-zA-Z0-9_$]+)\s*\(/);
    if (pyMatch) {
      return pyMatch[1];
    }
  }
  return 'root';
}

function getCodeContext(lines: string[], targetIndex: number, contextRadius = 3): CodeContext {
  const start = Math.max(0, targetIndex - contextRadius);
  const end = Math.min(lines.length - 1, targetIndex + contextRadius);

  return {
    startLineNumber: start + 1,
    beforeLines: lines.slice(start, targetIndex),
    targetLine: lines[targetIndex] || '',
    afterLines: lines.slice(targetIndex + 1, end + 1),
  };
}

export function analyzeRepositoryFiles(
  repoName: string,
  source: 'upload-zip' | 'local-folder' | 'git-url' | 'demo-template',
  rawFiles: { path: string; content: string }[],
  sourceUrl?: string
): RepositoryScanSummary {
  const filteredFiles: RepositoryFile[] = rawFiles
    .filter(f => isSourceFile(f.path))
    .map((f, idx) => {
      const lines = f.content.split('\n');
      return {
        id: `file-${idx + 1}`,
        path: f.path,
        name: f.path.split('/').pop() || f.path,
        language: detectLanguage(f.path),
        content: f.content,
        lineCount: lines.length,
        sizeBytes: new Blob([f.content]).size,
        gapsCount: 0,
      };
    });

  const detectedLanguages = Array.from(new Set(filteredFiles.map(f => f.language)));
  const primaryLanguage = detectedLanguages[0] || 'TypeScript';
  const detectedFrameworks = detectFrameworks(filteredFiles);
  const detectedLogger = detectProjectLogger(filteredFiles, primaryLanguage);

  const findings: LoggingGapFinding[] = [];

  for (const file of filteredFiles) {
    const lines = file.content.split('\n');
    let fileGaps = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      const fnName = extractFunctionContext(lines, i);

      // Check 1: Swallowed Errors / Empty Catch Blocks
      const isCatch = trimmed.startsWith('catch ') || trimmed.startsWith('catch(') || trimmed === 'catch {' || trimmed.startsWith('except ');
      if (isCatch) {
        // Look inside catch block
        const nextLines = lines.slice(i + 1, Math.min(lines.length, i + 8)).map(l => l.trim());
        const hasLog = nextLines.some(l => l.includes('log') || l.includes('print('));
        const returnsEarly = nextLines.some(l => l.startsWith('return ') || l === 'return' || l === 'pass');

        if (!hasLog) {
          const errVar = trimmed.includes('err') ? 'err' : trimmed.includes('error') ? 'error' : trimmed.includes('e') ? 'e' : 'error';
          const recLog = file.language === 'Python'
            ? `logger.error(f"Error encountered in ${fnName}: {${errVar}}", exc_info=True)`
            : `${detectedLogger}.error({ err: ${errVar}, fn: '${fnName}' }, 'Unhandled exception caught in ${fnName}');`;

          const context = getCodeContext(lines, i);
          const originalLines = [line, ...lines.slice(i + 1, Math.min(lines.length, i + 3))];
          const patchedLines = [line, `    ${recLog}`, ...lines.slice(i + 1, Math.min(lines.length, i + 3))];

          findings.push({
            id: `gap-${file.id}-${i + 1}`,
            fileId: file.id,
            filePath: file.path,
            functionName: fnName,
            lineNumber: i + 1,
            severity: 'critical',
            category: 'swallowed-error',
            categoryLabel: 'Swallowed Error / Missing Failure Log',
            title: `Error caught in '${fnName}' without diagnostic logging`,
            explanation: `An exception is captured at line ${i + 1} but returned or discarded without logging error stack traces or context. If this fails in production, it will produce silent failures with zero observability.`,
            impactRisk: 'High risk of silent data corruption and impossible root-cause analysis in production.',
            recommendedLocation: `Inside catch block immediately at line ${i + 2}`,
            recommendedCode: recLog,
            confidenceScore: 97,
            codeContext: context,
            suggestedPatch: {
              originalCode: originalLines.join('\n'),
              patchedCode: patchedLines.join('\n'),
              unifiedDiff: generateUnifiedDiff(file.path, i + 1, originalLines, patchedLines),
            },
            patchStatus: 'pending',
            detectedFramework: detectedFrameworks[0] || 'Generic',
            detectedLanguage: file.language,
          });
          fileGaps++;
          continue;
        }
      }

      // Check 2: Database Operations without failure/success observability
      const isDbQuery =
        trimmed.includes('prisma.') ||
        trimmed.includes('.create(') ||
        trimmed.includes('.update(') ||
        trimmed.includes('.delete(') ||
        trimmed.includes('session.commit()') ||
        trimmed.includes('.query(');

      if (isDbQuery && !trimmed.startsWith('//') && !trimmed.startsWith('#')) {
        // Check if there is already a log right before or after
        const surrounding = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 4)).join('\n');
        if (!surrounding.includes('logger.') && !surrounding.includes('log.')) {
          const recLog = file.language === 'Python'
            ? `logger.info("Executing database transaction in ${fnName}")`
            : `${detectedLogger}.debug({ op: '${fnName}', timestamp: Date.now() }, 'Executing database mutation');`;

          const context = getCodeContext(lines, i);
          const originalLines = [line];
          const patchedLines = [`    ${recLog}`, line];

          findings.push({
            id: `gap-${file.id}-${i + 1}`,
            fileId: file.id,
            filePath: file.path,
            functionName: fnName,
            lineNumber: i + 1,
            severity: 'high',
            category: 'database-operation',
            categoryLabel: 'Unlogged Database Transaction',
            title: `Database operation in '${fnName}' lacks mutation telemetry`,
            explanation: `Database mutation executed without before-or-after telemetry. Unlogged database operations make tracing data anomalies or transaction deadlocks extremely difficult.`,
            impactRisk: 'Unable to correlate data discrepancies with client requests or trace execution latency.',
            recommendedLocation: `Preceding database operation at line ${i + 1}`,
            recommendedCode: recLog,
            confidenceScore: 91,
            codeContext: context,
            suggestedPatch: {
              originalCode: originalLines.join('\n'),
              patchedCode: patchedLines.join('\n'),
              unifiedDiff: generateUnifiedDiff(file.path, i + 1, originalLines, patchedLines),
            },
            patchStatus: 'pending',
            detectedFramework: detectedFrameworks.find(f => f.includes('Prisma') || f.includes('SQL')) || 'ORM',
            detectedLanguage: file.language,
          });
          fileGaps++;
          continue;
        }
      }

      // Check 3: External API Calls & Webhooks
      const isExternalCall =
        trimmed.includes('stripeClient.') ||
        trimmed.includes('stripe.') ||
        trimmed.includes('httpx.') ||
        trimmed.includes('fetch(') ||
        trimmed.includes('axios.');

      if (isExternalCall && !trimmed.startsWith('//') && !trimmed.startsWith('#')) {
        const surrounding = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 4)).join('\n');
        if (!surrounding.includes('logger.') && !surrounding.includes('log.')) {
          const recLog = file.language === 'Python'
            ? `logger.info(f"Initiating outbound external call in {fnName}")`
            : `${detectedLogger}.info({ service: 'outbound-api', fn: '${fnName}' }, 'Dispatching external API request');`;

          const context = getCodeContext(lines, i);
          const originalLines = [line];
          const patchedLines = [`    ${recLog}`, line];

          findings.push({
            id: `gap-${file.id}-${i + 1}`,
            fileId: file.id,
            filePath: file.path,
            functionName: fnName,
            lineNumber: i + 1,
            severity: 'high',
            category: 'external-api',
            categoryLabel: 'Unobserved External Service Call',
            title: `Outbound integration in '${fnName}' has no latency or call log`,
            explanation: `External service request executed without recording outbound payload headers, endpoint target, or network status. Third-party outages will appear as mystery bottlenecks.`,
            impactRisk: 'Service timeouts and rate-limiting cannot be diagnosed without external request records.',
            recommendedLocation: `Before dispatching network request at line ${i + 1}`,
            recommendedCode: recLog,
            confidenceScore: 94,
            codeContext: context,
            suggestedPatch: {
              originalCode: originalLines.join('\n'),
              patchedCode: patchedLines.join('\n'),
              unifiedDiff: generateUnifiedDiff(file.path, i + 1, originalLines, patchedLines),
            },
            patchStatus: 'pending',
            detectedFramework: 'HTTP Client',
            detectedLanguage: file.language,
          });
          fileGaps++;
          continue;
        }
      }

      // Check 4: Critical Business Logic State Transitions
      const isCriticalState =
        (trimmed.includes('tier:') ||
          trimmed.includes('isSuspended:') ||
          trimmed.includes("status: 'ACTIVE'") ||
          trimmed.includes("status: 'SUCCESS'") ||
          trimmed.includes('renewSubscription') ||
          trimmed.includes('trigger_emergency_alert')) &&
        !trimmed.startsWith('//');

      if (isCriticalState) {
        const surrounding = lines.slice(Math.max(0, i - 2), Math.min(lines.length, i + 3)).join('\n');
        if (!surrounding.includes('logger.') && !surrounding.includes('log.')) {
          const recLog = file.language === 'Python'
            ? `logger.warning(f"CRITICAL STATE TRANSITION in {fnName}")`
            : `${detectedLogger}.warn({ stateChange: true, fn: '${fnName}' }, 'Critical business state transition applied');`;

          const context = getCodeContext(lines, i);
          const originalLines = [line];
          const patchedLines = [`    ${recLog}`, line];

          findings.push({
            id: `gap-${file.id}-${i + 1}`,
            fileId: file.id,
            filePath: file.path,
            functionName: fnName,
            lineNumber: i + 1,
            severity: 'high',
            category: 'critical-business-logic',
            categoryLabel: 'Critical Business State Transition',
            title: `State modification in '${fnName}' missing audit trail`,
            explanation: `High-value state change detected (account suspension, plan tier change, status toggle) with no security audit log statement recorded.`,
            impactRisk: 'Inability to track who initiated authorization or billing changes during audit inspections.',
            recommendedLocation: `Line ${i + 1} alongside state mutation`,
            recommendedCode: recLog,
            confidenceScore: 89,
            codeContext: context,
            suggestedPatch: {
              originalCode: originalLines.join('\n'),
              patchedCode: patchedLines.join('\n'),
              unifiedDiff: generateUnifiedDiff(file.path, i + 1, originalLines, patchedLines),
            },
            patchStatus: 'pending',
            detectedFramework: detectedFrameworks[0] || 'Core',
            detectedLanguage: file.language,
          });
          fileGaps++;
          continue;
        }
      }

      // Check 5: Unlogged 401/403/500 Error Responses
      const isErrorResponse =
        (trimmed.includes('res.status(401)') ||
          trimmed.includes('res.status(403)') ||
          trimmed.includes('res.status(500)') ||
          trimmed.includes('raise HTTPException(status_code=500')) &&
        !trimmed.startsWith('//');

      if (isErrorResponse) {
        const surrounding = lines.slice(Math.max(0, i - 3), Math.min(lines.length, i + 2)).join('\n');
        if (!surrounding.includes('logger.') && !surrounding.includes('log.')) {
          const recLog = file.language === 'Python'
            ? `logger.error("HTTP 500 error response sent to client in ${fnName}")`
            : `${detectedLogger}.warn({ status: 401, path: req?.path, ip: req?.ip }, 'Client request rejected due to auth failure');`;

          const context = getCodeContext(lines, i);
          const originalLines = [line];
          const patchedLines = [`    ${recLog}`, line];

          findings.push({
            id: `gap-${file.id}-${i + 1}`,
            fileId: file.id,
            filePath: file.path,
            functionName: fnName,
            lineNumber: i + 1,
            severity: 'medium',
            category: 'unlogged-error-response',
            categoryLabel: 'Unlogged Failure Response',
            title: `Failure status response returned in '${fnName}' without client diagnostics`,
            explanation: `An error response is returned to the client without recording client telemetry (IP, endpoint, request headers, error reason).`,
            impactRisk: 'Difficulty distinguishing between authentic user errors and brute-force or injection attempts.',
            recommendedLocation: `Immediately before returning error response at line ${i + 1}`,
            recommendedCode: recLog,
            confidenceScore: 88,
            codeContext: context,
            suggestedPatch: {
              originalCode: originalLines.join('\n'),
              patchedCode: patchedLines.join('\n'),
              unifiedDiff: generateUnifiedDiff(file.path, i + 1, originalLines, patchedLines),
            },
            patchStatus: 'pending',
            detectedFramework: detectedFrameworks[0] || 'API',
            detectedLanguage: file.language,
          });
          fileGaps++;
          continue;
        }
      }
    }

    file.gapsCount = fileGaps;
  }

  // Calculate stats
  const severityCounts = {
    critical: findings.filter(f => f.severity === 'critical').length,
    high: findings.filter(f => f.severity === 'high').length,
    medium: findings.filter(f => f.severity === 'medium').length,
    low: findings.filter(f => f.severity === 'low').length,
  };

  const categoryCounts: Record<GapCategory, number> = {
    'swallowed-error': findings.filter(f => f.category === 'swallowed-error').length,
    'database-operation': findings.filter(f => f.category === 'database-operation').length,
    'external-api': findings.filter(f => f.category === 'external-api').length,
    'critical-business-logic': findings.filter(f => f.category === 'critical-business-logic').length,
    'complex-function': findings.filter(f => f.category === 'complex-function').length,
    'retry-timeout': findings.filter(f => f.category === 'retry-timeout').length,
    'unlogged-error-response': findings.filter(f => f.category === 'unlogged-error-response').length,
  };

  const initialScore = calculateHealthScore(findings);
  const totalLines = filteredFiles.reduce((acc, f) => acc + f.lineCount, 0);

  return {
    id: `scan-${Date.now()}`,
    repositoryName: repoName,
    repositorySource: source,
    sourceUrl,
    scanTimestamp: Date.now(),
    primaryLanguage,
    detectedLanguages,
    detectedFrameworks,
    detectedLogger,
    totalFilesScanned: filteredFiles.length,
    totalLinesOfCode: totalLines,
    initialHealthScore: initialScore,
    currentHealthScore: initialScore,
    findings,
    severityCounts,
    categoryCounts,
    files: filteredFiles,
  };
}
