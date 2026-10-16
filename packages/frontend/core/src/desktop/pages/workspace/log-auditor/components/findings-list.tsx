import { Button } from '@nexio/component';
import React, { useState } from 'react';
import type { GapCategory, LoggingGapFinding, PatchStatus, SeverityLevel } from '../types';
import { FindingCard } from './finding-card';

interface FindingsListProps {
  findings: LoggingGapFinding[];
  selectedSeverity: SeverityLevel | 'all';
  onSelectSeverity: (sev: SeverityLevel | 'all') => void;
  onAcceptPatch: (id: string) => void;
  onRejectPatch: (id: string) => void;
  onResetPatch: (id: string) => void;
  selectedFileFilter?: string | null;
  onClearFileFilter?: () => void;
}

export const FindingsList: React.FC<FindingsListProps> = ({
  findings,
  selectedSeverity,
  onSelectSeverity,
  onAcceptPatch,
  onRejectPatch,
  onResetPatch,
  selectedFileFilter,
  onClearFileFilter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<GapCategory | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<PatchStatus | 'all'>('all');

  const filtered = findings.filter(f => {
    if (selectedSeverity !== 'all' && f.severity !== selectedSeverity) return false;
    if (selectedCategory !== 'all' && f.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && f.patchStatus !== selectedStatus) return false;
    if (selectedFileFilter && f.filePath !== selectedFileFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        f.filePath.toLowerCase().includes(q) ||
        f.functionName.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q) ||
        f.explanation.toLowerCase().includes(q);
      if (!match) return false;
    }

    return true;
  });

  const categories: { key: GapCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All Categories' },
    { key: 'swallowed-error', label: 'Swallowed Errors' },
    { key: 'database-operation', label: 'Database Ops' },
    { key: 'external-api', label: 'External APIs' },
    { key: 'critical-business-logic', label: 'Business Logic' },
    { key: 'unlogged-error-response', label: 'Error Responses' },
  ];

  return (
    <div style={{ padding: '0 32px 48px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Search & Filter Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          padding: '16px',
          borderRadius: '12px',
          backgroundColor: 'var(--affine-background-primary-color)',
          border: '1px solid var(--affine-border-color)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            placeholder="Search by file, function, or keyword..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid var(--affine-border-color)',
              backgroundColor: 'var(--affine-background-secondary-color)',
              color: 'var(--affine-text-primary-color)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value as any)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--affine-border-color)',
              backgroundColor: 'var(--affine-background-secondary-color)',
              color: 'var(--affine-text-primary-color)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            {categories.map(c => (
              <option key={c.key} value={c.key}>
                {c.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value as any)}
            style={{
              padding: '8px 12px',
              borderRadius: '8px',
              border: '1px solid var(--affine-border-color)',
              backgroundColor: 'var(--affine-background-secondary-color)',
              color: 'var(--affine-text-primary-color)',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="accepted">Accepted / Patched</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Active File Filter Indicator */}
      {selectedFileFilter && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 16px',
            borderRadius: '8px',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.25)',
            fontSize: '13px',
          }}
        >
          <span>
            Filtering by file: <strong>{selectedFileFilter}</strong>
          </span>
          <Button size="small" onClick={onClearFileFilter}>
            Clear File Filter
          </Button>
        </div>
      )}

      {/* Results Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', color: 'var(--affine-text-secondary-color)' }}>
        <div>
          Showing <strong>{filtered.length}</strong> of <strong>{findings.length}</strong> logging gaps detected
        </div>

        {selectedSeverity !== 'all' && (
          <Button size="small" onClick={() => onSelectSeverity('all')}>
            Reset Severity Filter ({selectedSeverity})
          </Button>
        )}
      </div>

      {/* Cards List */}
      {filtered.length === 0 ? (
        <div
          style={{
            padding: '48px 32px',
            textAlign: 'center',
            borderRadius: '12px',
            backgroundColor: 'var(--affine-background-primary-color)',
            border: '1px solid var(--affine-border-color)',
          }}
        >
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>🎉</div>
          <h3 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: 600 }}>No logging gaps found</h3>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--affine-text-secondary-color)' }}>
            Try adjusting your search query or filters to inspect other findings.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filtered.map(f => (
            <FindingCard
              key={f.id}
              finding={f}
              onAcceptPatch={onAcceptPatch}
              onRejectPatch={onRejectPatch}
              onResetPatch={onResetPatch}
            />
          ))}
        </div>
      )}
    </div>
  );
};
