import React from 'react';
import type { RepositoryScanSummary, SeverityLevel } from '../types';

interface StatsSummaryProps {
  scan: RepositoryScanSummary;
  selectedSeverity: SeverityLevel | 'all';
  onSelectSeverity: (severity: SeverityLevel | 'all') => void;
  acceptedCount: number;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({
  scan,
  selectedSeverity,
  onSelectSeverity,
  acceptedCount,
}) => {
  const currentHealth = scan.currentHealthScore;
  const initialHealth = scan.initialHealthScore;

  const healthColor =
    currentHealth >= 85 ? '#10b981' : currentHealth >= 65 ? '#f59e0b' : '#ef4444';

  const severityCards = [
    {
      level: 'critical' as const,
      label: 'Critical Gaps',
      count: scan.severityCounts.critical,
      desc: 'Swallowed errors & silent failures',
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.08)',
      border: 'rgba(239, 68, 68, 0.25)',
    },
    {
      level: 'high' as const,
      label: 'High Severity',
      count: scan.severityCounts.high,
      desc: 'Unlogged DB & external calls',
      color: '#f97316',
      bg: 'rgba(249, 115, 22, 0.08)',
      border: 'rgba(249, 115, 22, 0.25)',
    },
    {
      level: 'medium' as const,
      label: 'Medium Gaps',
      count: scan.severityCounts.medium,
      desc: 'Unobserved HTTP status & retries',
      color: '#eab308',
      bg: 'rgba(234, 179, 8, 0.08)',
      border: 'rgba(234, 179, 8, 0.25)',
    },
    {
      level: 'low' as const,
      label: 'Low Severity',
      count: scan.severityCounts.low,
      desc: 'Minor diagnostic omissions',
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.08)',
      border: 'rgba(59, 130, 246, 0.25)',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        padding: '0 32px',
        marginTop: '24px',
      }}
    >
      {/* Health Score Card */}
      <div
        style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: 'var(--affine-background-primary-color)',
          border: '1px solid var(--affine-border-color)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <span style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)', fontWeight: 600, textTransform: 'uppercase' }}>
              Logging Health Score
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '6px' }}>
              <span style={{ fontSize: '36px', fontWeight: 800, color: healthColor }}>
                {currentHealth}%
              </span>
              {currentHealth > initialHealth && (
                <span style={{ fontSize: '13px', fontWeight: 600, color: '#10b981' }}>
                  ↑ +{currentHealth - initialHealth}%
                </span>
              )}
            </div>
          </div>

          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              border: `4px solid ${healthColor}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              fontWeight: 700,
            }}
          >
            {currentHealth >= 80 ? 'A' : currentHealth >= 60 ? 'B' : 'C'}
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <div style={{ height: '6px', borderRadius: '3px', backgroundColor: 'var(--affine-hover-color)', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${currentHealth}%`,
                backgroundColor: healthColor,
                transition: 'width 0.4s ease-in-out',
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--affine-text-secondary-color)', marginTop: '6px' }}>
            <span>Initial: {initialHealth}%</span>
            <span>Target: 100%</span>
          </div>
        </div>
      </div>

      {/* Scope Card */}
      <div
        style={{
          padding: '20px',
          borderRadius: '12px',
          backgroundColor: 'var(--affine-background-primary-color)',
          border: '1px solid var(--affine-border-color)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <div>
          <span style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)', fontWeight: 600, textTransform: 'uppercase' }}>
            Repository Scope
          </span>
          <div style={{ fontSize: '36px', fontWeight: 800, marginTop: '6px' }}>
            {scan.totalFilesScanned} <span style={{ fontSize: '16px', fontWeight: 500, color: 'var(--affine-text-secondary-color)' }}>files</span>
          </div>
        </div>

        <div style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)' }}>
          <div><strong>{scan.totalLinesOfCode.toLocaleString()}</strong> lines scanned</div>
          <div style={{ marginTop: '4px' }}><strong>{acceptedCount}</strong> patches applied</div>
        </div>
      </div>

      {/* Severity Filter Cards */}
      {severityCards.map(item => {
        const isSelected = selectedSeverity === item.level;
        return (
          <div
            key={item.level}
            onClick={() => onSelectSeverity(isSelected ? 'all' : item.level)}
            style={{
              padding: '20px',
              borderRadius: '12px',
              backgroundColor: isSelected ? item.bg : 'var(--affine-background-primary-color)',
              border: isSelected ? `2px solid ${item.color}` : '1px solid var(--affine-border-color)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', color: item.color, fontWeight: 700, textTransform: 'uppercase' }}>
                  {item.label}
                </span>
                {isSelected && (
                  <span style={{ fontSize: '11px', padding: '1px 6px', borderRadius: '4px', backgroundColor: item.color, color: '#fff' }}>
                    Active
                  </span>
                )}
              </div>
              <div style={{ fontSize: '36px', fontWeight: 800, color: item.color, marginTop: '6px' }}>
                {item.count}
              </div>
            </div>

            <div style={{ fontSize: '11px', color: 'var(--affine-text-secondary-color)', marginTop: '8px' }}>
              {item.desc}
            </div>
          </div>
        );
      })}
    </div>
  );
};
