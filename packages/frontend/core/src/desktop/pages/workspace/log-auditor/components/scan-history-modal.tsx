import { Button } from '@nexio/component';
import React from 'react';
import type { RepositoryScanSummary } from '../types';

interface ScanHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: RepositoryScanSummary[];
  onSelectScan: (scan: RepositoryScanSummary) => void;
  onClearHistory: () => void;
}

export const ScanHistoryModal: React.FC<ScanHistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onSelectScan,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(4px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '640px',
          maxWidth: '100%',
          backgroundColor: 'var(--affine-background-primary-color)',
          borderRadius: '16px',
          border: '1px solid var(--affine-border-color)',
          boxShadow: '0 20px 48px rgba(0, 0, 0, 0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '80vh',
        }}
      >
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--affine-border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '20px' }}>📜</span>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
              Scan History & Audit Logs
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '18px',
              cursor: 'pointer',
              color: 'var(--affine-text-secondary-color)',
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--affine-text-secondary-color)' }}>
              No previous scans recorded yet.
            </div>
          ) : (
            history.map(item => {
              const formattedDate = new Date(item.scanTimestamp).toLocaleString();
              const accepted = item.findings.filter(f => f.patchStatus === 'accepted').length;

              return (
                <div
                  key={item.id}
                  style={{
                    padding: '16px',
                    borderRadius: '10px',
                    backgroundColor: 'var(--affine-background-secondary-color)',
                    border: '1px solid var(--affine-border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px' }}>{item.repositoryName}</div>
                    <div style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)', marginTop: '4px' }}>
                      {formattedDate} • {item.totalFilesScanned} files • {item.findings.length} gaps detected
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px', fontSize: '11px' }}>
                      <span style={{ color: item.currentHealthScore >= 80 ? '#10b981' : '#f59e0b', fontWeight: 600 }}>
                        Health: {item.currentHealthScore}%
                      </span>
                      <span>•</span>
                      <span style={{ color: '#059669' }}>{accepted} Patches Applied</span>
                    </div>
                  </div>

                  <Button
                    size="small"
                    onClick={() => {
                      onSelectScan(item);
                      onClose();
                    }}
                  >
                    Open Audit →
                  </Button>
                </div>
              );
            })
          )}
        </div>

        {history.length > 0 && (
          <div
            style={{
              padding: '14px 24px',
              borderTop: '1px solid var(--affine-border-color)',
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <Button size="small" onClick={onClearHistory} style={{ color: '#ef4444' }}>
              Clear History
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
