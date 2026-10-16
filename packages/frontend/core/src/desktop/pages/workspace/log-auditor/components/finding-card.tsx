import { Button } from '@nexio/component';
import { notify } from '@nexio/component/ui/notification';
import React, { useState } from 'react';
import type { LoggingGapFinding } from '../types';
import { PatchDiffViewer } from './patch-diff-viewer';

interface FindingCardProps {
  finding: LoggingGapFinding;
  onAcceptPatch: (id: string) => void;
  onRejectPatch: (id: string) => void;
  onResetPatch: (id: string) => void;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
  onAcceptPatch,
  onRejectPatch,
  onResetPatch,
}) => {
  const [showDiff, setShowDiff] = useState(true);

  const severityColors = {
    critical: { text: '#dc2626', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
    high: { text: '#ea580c', bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.3)' },
    medium: { text: '#ca8a04', bg: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.3)' },
    low: { text: '#2563eb', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' },
  };

  const sev = severityColors[finding.severity];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(finding.recommendedCode);
    notify({
      title: 'Copied to clipboard',
      message: 'Recommended logging code copied to clipboard.',
    });
  };

  return (
    <div
      style={{
        borderRadius: '12px',
        backgroundColor: 'var(--affine-background-primary-color)',
        border: finding.patchStatus === 'accepted'
          ? '2px solid rgba(16, 185, 129, 0.4)'
          : finding.patchStatus === 'rejected'
          ? '1px solid var(--affine-border-color)'
          : `1px solid ${sev.border}`,
        opacity: finding.patchStatus === 'rejected' ? 0.6 : 1,
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        transition: 'all 0.2s ease',
      }}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <span
            style={{
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              textTransform: 'uppercase',
              color: sev.text,
              backgroundColor: sev.bg,
              border: `1px solid ${sev.border}`,
            }}
          >
            {finding.severity}
          </span>

          <span
            style={{
              padding: '3px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--affine-text-secondary-color)',
              backgroundColor: 'var(--affine-background-secondary-color)',
              border: '1px solid var(--affine-border-color)',
            }}
          >
            {finding.categoryLabel}
          </span>

          <span
            style={{
              fontSize: '12px',
              color: 'var(--affine-text-secondary-color)',
              fontWeight: 500,
            }}
          >
            🎯 {finding.confidenceScore}% Confidence
          </span>
        </div>

        {/* Patch Status Badge */}
        {finding.patchStatus === 'accepted' ? (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#059669',
              fontSize: '12px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            ✓ Patch Applied
          </span>
        ) : finding.patchStatus === 'rejected' ? (
          <span
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              backgroundColor: 'var(--affine-hover-color)',
              color: 'var(--affine-text-secondary-color)',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            ✕ Dismissed
          </span>
        ) : null}
      </div>

      {/* Title & File Path */}
      <div>
        <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: 700 }}>
          {finding.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--affine-text-secondary-color)' }}>
          <span>📂 <code>{finding.filePath}:{finding.lineNumber}</code></span>
          <span>•</span>
          <span>Function: <code>{finding.functionName}()</code></span>
        </div>
      </div>

      {/* Explanation & Risk */}
      <div
        style={{
          padding: '12px 16px',
          borderRadius: '8px',
          backgroundColor: 'var(--affine-background-secondary-color)',
          fontSize: '13px',
          lineHeight: '1.5',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        <div>{finding.explanation}</div>
        <div style={{ color: sev.text, fontWeight: 600, fontSize: '12px' }}>
          ⚠️ Production Risk: {finding.impactRisk}
        </div>
      </div>

      {/* Recommendation Snippet Callout */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderRadius: '6px',
          backgroundColor: 'var(--affine-hover-color)',
          fontSize: '12px',
          fontFamily: 'monospace',
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          💡 Proposed: <strong style={{ color: '#059669' }}>{finding.recommendedCode}</strong>
        </span>
        <Button size="small" onClick={handleCopyCode} style={{ flexShrink: 0, marginLeft: '12px' }}>
          Copy
        </Button>
      </div>

      {/* Diff Preview Toggle & Viewer */}
      <div>
        <button
          onClick={() => setShowDiff(!showDiff)}
          style={{
            background: 'none',
            border: 'none',
            color: '#2563eb',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          {showDiff ? '▼ Hide Code Diff Preview' : '▶ Show Code Diff Preview'}
        </button>

        {showDiff && <PatchDiffViewer finding={finding} />}
      </div>

      {/* Card Actions */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          gap: '10px',
          paddingTop: '10px',
          borderTop: '1px solid var(--affine-border-color)',
        }}
      >
        {finding.patchStatus === 'accepted' ? (
          <Button size="small" onClick={() => onResetPatch(finding.id)}>
            Undo Patch
          </Button>
        ) : finding.patchStatus === 'rejected' ? (
          <Button size="small" onClick={() => onResetPatch(finding.id)}>
            Restore Suggestion
          </Button>
        ) : (
          <>
            <Button
              size="small"
              onClick={() => onRejectPatch(finding.id)}
              style={{ color: 'var(--affine-text-secondary-color)' }}
            >
              Reject
            </Button>
            <Button
              size="small"
              variant="primary"
              onClick={() => onAcceptPatch(finding.id)}
              style={{
                backgroundColor: '#10b981',
                borderColor: '#059669',
                color: '#ffffff',
                fontWeight: 600,
              }}
            >
              ✓ Accept & Apply Patch
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
