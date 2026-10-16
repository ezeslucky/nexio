import { Button, IconButton } from '@nexio/component';
import { notify } from '@nexio/component/ui/notification';
import React from 'react';
import type { RepositoryScanSummary } from '../types';

interface DashboardHeaderProps {
  scan: RepositoryScanSummary;
  onOpenNewScan: () => void;
  onOpenHistory: () => void;
  onBatchAcceptCritical: () => void;
  onExportPatchedRepo: () => void;
  acceptedCount: number;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  scan,
  onOpenNewScan,
  onOpenHistory,
  onBatchAcceptCritical,
  onExportPatchedRepo,
  acceptedCount,
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '24px 32px',
        backgroundColor: 'var(--affine-background-primary-color)',
        borderBottom: '1px solid var(--affine-border-color)',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
              fontSize: '22px',
            }}
          >
            🛡️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>
                AI Logging Sentinel
              </h1>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(59, 130, 246, 0.12)',
                  color: '#2563eb',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                }}
              >
                Auditor Pro
              </span>
            </div>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: 'var(--affine-text-secondary-color)' }}>
              Automated repository code-flow analysis & proactive observability gap detector
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button onClick={onOpenHistory}>
            📜 Scan History
          </Button>

          <Button
            onClick={onBatchAcceptCritical}
            disabled={scan.findings.filter(f => f.severity === 'critical' && f.patchStatus === 'pending').length === 0}
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#dc2626',
              border: '1px solid rgba(239, 68, 68, 0.25)',
            }}
          >
            ⚡ Auto-Patch Critical ({scan.findings.filter(f => f.severity === 'critical' && f.patchStatus === 'pending').length})
          </Button>

          <Button
            onClick={onExportPatchedRepo}
            style={{
              backgroundColor: acceptedCount > 0 ? 'rgba(16, 185, 129, 0.12)' : undefined,
              color: acceptedCount > 0 ? '#059669' : undefined,
              borderColor: acceptedCount > 0 ? 'rgba(16, 185, 129, 0.3)' : undefined,
            }}
          >
            📥 Export Patched Files {acceptedCount > 0 && `(${acceptedCount})`}
          </Button>

          <Button
            variant="primary"
            onClick={onOpenNewScan}
            style={{
              background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
              fontWeight: 600,
            }}
          >
            + Scan Repository
          </Button>
        </div>
      </div>

      {/* Repository Context Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          backgroundColor: 'var(--affine-background-secondary-color)',
          borderRadius: '8px',
          border: '1px solid var(--affine-border-color)',
          fontSize: '13px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 600 }}>📁 {scan.repositoryName}</span>
          <span style={{ color: 'var(--affine-text-secondary-color)' }}>•</span>
          <span>Source: <strong style={{ textTransform: 'capitalize' }}>{scan.repositorySource.replace('-', ' ')}</strong></span>
          <span style={{ color: 'var(--affine-text-secondary-color)' }}>•</span>
          <span>Language: <strong>{scan.primaryLanguage}</strong></span>
          <span style={{ color: 'var(--affine-text-secondary-color)' }}>•</span>
          <span>Logger: <code style={{ backgroundColor: 'var(--affine-hover-color)', padding: '2px 6px', borderRadius: '4px' }}>{scan.detectedLogger}</code></span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--affine-text-secondary-color)', fontSize: '12px' }}>Frameworks:</span>
          {scan.detectedFrameworks.map(fw => (
            <span
              key={fw}
              style={{
                fontSize: '11px',
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: 'var(--affine-background-primary-color)',
                border: '1px solid var(--affine-border-color)',
              }}
            >
              {fw}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
