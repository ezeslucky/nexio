import React, { useState } from 'react';
import type { LoggingGapFinding } from '../types';

interface PatchDiffViewerProps {
  finding: LoggingGapFinding;
}

export const PatchDiffViewer: React.FC<PatchDiffViewerProps> = ({ finding }) => {
  const [viewMode, setViewMode] = useState<'split' | 'unified'>('split');
  const { codeContext, recommendedCode } = finding;

  const originalBefore = codeContext.beforeLines;
  const originalTarget = codeContext.targetLine;
  const originalAfter = codeContext.afterLines;

  return (
    <div
      style={{
        marginTop: '16px',
        borderRadius: '8px',
        border: '1px solid var(--affine-border-color)',
        backgroundColor: '#0d1117',
        color: '#c9d1d9',
        fontFamily: 'SFMono-Regular, Consolas, "Liberation Mono", Menlo, monospace',
        fontSize: '12px',
        overflow: 'hidden',
      }}
    >
      {/* Diff Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          backgroundColor: '#161b22',
          borderBottom: '1px solid #30363d',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#58a6ff' }}>📄 {finding.filePath}</span>
          <span style={{ color: '#8b949e' }}>: line {finding.lineNumber}</span>
          <span
            style={{
              padding: '1px 6px',
              borderRadius: '4px',
              backgroundColor: '#238636',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 600,
            }}
          >
            AI Patch
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => setViewMode('split')}
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #30363d',
              backgroundColor: viewMode === 'split' ? '#30363d' : 'transparent',
              color: viewMode === 'split' ? '#ffffff' : '#8b949e',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            Split
          </button>
          <button
            onClick={() => setViewMode('unified')}
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid #30363d',
              backgroundColor: viewMode === 'unified' ? '#30363d' : 'transparent',
              color: viewMode === 'unified' ? '#ffffff' : '#8b949e',
              cursor: 'pointer',
              fontSize: '11px',
            }}
          >
            Unified
          </button>
        </div>
      </div>

      {/* Split View */}
      {viewMode === 'split' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', overflowX: 'auto' }}>
          {/* Left: Original */}
          <div style={{ borderRight: '1px solid #30363d', padding: '12px 0' }}>
            <div style={{ padding: '0 16px 8px', color: '#8b949e', fontWeight: 600, borderBottom: '1px solid #21262d', fontSize: '11px' }}>
              Original Code (Missing Observability)
            </div>
            {originalBefore.map((line, idx) => (
              <div key={`b-${idx}`} style={{ display: 'flex', padding: '2px 16px' }}>
                <span style={{ width: '32px', color: '#484f58', userSelect: 'none' }}>
                  {codeContext.startLineNumber + idx}
                </span>
                <span style={{ whiteSpace: 'pre-wrap', color: '#8b949e' }}>{line}</span>
              </div>
            ))}
            <div style={{ display: 'flex', padding: '3px 16px', backgroundColor: 'rgba(248, 81, 73, 0.15)', borderLeft: '3px solid #f85149' }}>
              <span style={{ width: '32px', color: '#f85149', userSelect: 'none' }}>
                {finding.lineNumber}
              </span>
              <span style={{ whiteSpace: 'pre-wrap', color: '#ff7b72' }}>{originalTarget}</span>
            </div>
            {originalAfter.map((line, idx) => (
              <div key={`a-${idx}`} style={{ display: 'flex', padding: '2px 16px' }}>
                <span style={{ width: '32px', color: '#484f58', userSelect: 'none' }}>
                  {finding.lineNumber + 1 + idx}
                </span>
                <span style={{ whiteSpace: 'pre-wrap', color: '#8b949e' }}>{line}</span>
              </div>
            ))}
          </div>

          {/* Right: AI Patched */}
          <div style={{ padding: '12px 0' }}>
            <div style={{ padding: '0 16px 8px', color: '#3fb950', fontWeight: 600, borderBottom: '1px solid #21262d', fontSize: '11px' }}>
              Proposed Patch (With Structured Telemetry)
            </div>
            {originalBefore.map((line, idx) => (
              <div key={`pb-${idx}`} style={{ display: 'flex', padding: '2px 16px' }}>
                <span style={{ width: '32px', color: '#484f58', userSelect: 'none' }}>
                  {codeContext.startLineNumber + idx}
                </span>
                <span style={{ whiteSpace: 'pre-wrap', color: '#8b949e' }}>{line}</span>
              </div>
            ))}
            <div style={{ display: 'flex', padding: '3px 16px', backgroundColor: 'rgba(63, 185, 80, 0.18)', borderLeft: '3px solid #2ea043' }}>
              <span style={{ width: '32px', color: '#3fb950', userSelect: 'none' }}>+</span>
              <span style={{ whiteSpace: 'pre-wrap', color: '#7ee787', fontWeight: 600 }}>
                {recommendedCode}
              </span>
            </div>
            <div style={{ display: 'flex', padding: '2px 16px' }}>
              <span style={{ width: '32px', color: '#484f58', userSelect: 'none' }}>
                {finding.lineNumber}
              </span>
              <span style={{ whiteSpace: 'pre-wrap' }}>{originalTarget}</span>
            </div>
            {originalAfter.map((line, idx) => (
              <div key={`pa-${idx}`} style={{ display: 'flex', padding: '2px 16px' }}>
                <span style={{ width: '32px', color: '#484f58', userSelect: 'none' }}>
                  {finding.lineNumber + 1 + idx}
                </span>
                <span style={{ whiteSpace: 'pre-wrap', color: '#8b949e' }}>{line}</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Unified View */
        <div style={{ padding: '12px 0', overflowX: 'auto' }}>
          {originalBefore.map((line, idx) => (
            <div key={`ub-${idx}`} style={{ display: 'flex', padding: '2px 16px' }}>
              <span style={{ width: '36px', color: '#484f58', userSelect: 'none' }}>
                {codeContext.startLineNumber + idx}
              </span>
              <span style={{ width: '20px', color: '#484f58' }}> </span>
              <span style={{ whiteSpace: 'pre-wrap', color: '#8b949e' }}>{line}</span>
            </div>
          ))}
          <div style={{ display: 'flex', padding: '2px 16px', backgroundColor: 'rgba(248, 81, 73, 0.15)' }}>
            <span style={{ width: '36px', color: '#f85149', userSelect: 'none' }}>{finding.lineNumber}</span>
            <span style={{ width: '20px', color: '#f85149', fontWeight: 700 }}>-</span>
            <span style={{ whiteSpace: 'pre-wrap', color: '#ff7b72' }}>{originalTarget}</span>
          </div>
          <div style={{ display: 'flex', padding: '2px 16px', backgroundColor: 'rgba(63, 185, 80, 0.18)' }}>
            <span style={{ width: '36px', color: '#3fb950', userSelect: 'none' }}>{finding.lineNumber}</span>
            <span style={{ width: '20px', color: '#3fb950', fontWeight: 700 }}>+</span>
            <span style={{ whiteSpace: 'pre-wrap', color: '#7ee787', fontWeight: 600 }}>
              {recommendedCode}
            </span>
          </div>
          <div style={{ display: 'flex', padding: '2px 16px', backgroundColor: 'rgba(63, 185, 80, 0.1)' }}>
            <span style={{ width: '36px', color: '#3fb950', userSelect: 'none' }}>{finding.lineNumber + 1}</span>
            <span style={{ width: '20px', color: '#3fb950', fontWeight: 700 }}>+</span>
            <span style={{ whiteSpace: 'pre-wrap', color: '#c9d1d9' }}>{originalTarget}</span>
          </div>
          {originalAfter.map((line, idx) => (
            <div key={`ua-${idx}`} style={{ display: 'flex', padding: '2px 16px' }}>
              <span style={{ width: '36px', color: '#484f58', userSelect: 'none' }}>
                {finding.lineNumber + 2 + idx}
              </span>
              <span style={{ width: '20px', color: '#484f58' }}> </span>
              <span style={{ whiteSpace: 'pre-wrap', color: '#8b949e' }}>{line}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
