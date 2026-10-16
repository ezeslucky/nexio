import type { LoggingGapFinding, RepositoryFile } from '../types';

/**
 * Calculates a repository's Logging Health Score from 0 to 100 based on detected gaps and their severities.
 * Resolved/accepted patches progressively restore the score toward 100%.
 */
export function calculateHealthScore(findings: LoggingGapFinding[]): number {
  if (findings.length === 0) return 100;

  // Weightings for penalty per unaddressed finding
  const weights = {
    critical: 12,
    high: 7,
    medium: 3.5,
    low: 1.5,
  };

  let totalPenalty = 0;
  for (const finding of findings) {
    if (finding.patchStatus !== 'accepted') {
      totalPenalty += weights[finding.severity] || 3;
    }
  }

  const score = Math.max(15, Math.round(100 - totalPenalty));
  return score;
}

/**
 * Generates unified line-by-line diff format for visual presentation
 */
export function generateUnifiedDiff(
  filePath: string,
  targetLineNumber: number,
  originalLines: string[],
  patchedLines: string[]
): string {
  const header = `--- a/${filePath}\n+++ b/${filePath}\n@@ -${targetLineNumber},${originalLines.length} +${targetLineNumber},${patchedLines.length} @@`;
  const diffBody = [
    ...originalLines.map(l => `- ${l}`),
    ...patchedLines.map(l => `+ ${l}`),
  ].join('\n');

  return `${header}\n${diffBody}`;
}

/**
 * Applies an accepted patch into a file's content
 */
export function applyPatchToFile(
  fileContent: string,
  finding: LoggingGapFinding
): string {
  const lines = fileContent.split('\n');
  const targetIndex = finding.lineNumber - 1;

  if (targetIndex < 0 || targetIndex >= lines.length) {
    return fileContent;
  }

  const targetLine = lines[targetIndex];
  // Detect indentation
  const indentMatch = targetLine.match(/^(\s*)/);
  const indent = indentMatch ? indentMatch[1] : '    ';

  // Format the recommended logging statement with matching indentation
  const formattedLogStatement = finding.recommendedCode
    .split('\n')
    .map(l => `${indent}${l.trim()}`)
    .join('\n');

  // Insert the log statement at the recommended position (before or inside block)
  if (finding.category === 'swallowed-error') {
    // Insert immediately after the catch statement
    lines.splice(targetIndex + 1, 0, formattedLogStatement);
  } else if (finding.category === 'database-operation' || finding.category === 'external-api') {
    // Insert before the operation or inside try/catch wrapper
    lines.splice(targetIndex, 0, formattedLogStatement);
  } else {
    lines.splice(targetIndex, 0, formattedLogStatement);
  }

  return lines.join('\n');
}

/**
 * Strips potential sensitive keywords from generated log parameters
 */
export function sanitizeLogParameters(contextName: string): string {
  const sensitiveRegex = /password|secret|token|apikey|api_key|auth|credential|card|cvv|ssn/i;
  if (sensitiveRegex.test(contextName)) {
    return '[REDACTED]';
  }
  return contextName;
}
