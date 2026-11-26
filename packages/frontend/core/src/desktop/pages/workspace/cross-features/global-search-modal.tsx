import { Modal } from '@nexio/component';
import { WorkbenchService } from '@nexio/core/modules/workbench';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { useService } from '@toeverything/infra';
import { useCallback, useEffect, useRef, useState } from 'react';

import { CrossFeatureService } from './cross-feature-service';
import type { WorkspaceModuleType, WorkspaceSearchResult } from './types';

interface GlobalSearchModalProps {
  open: boolean;
  onClose: () => void;
}

const MODULE_LABELS: Record<string, { label: string; icon: string; color: string }> = {
  tracker: { label: 'Issue', icon: '☑️', color: '#3b82f6' },
  docs: { label: 'Doc', icon: '📄', color: '#10b981' },
  chat: { label: 'Chat', icon: '💬', color: '#8b5cf6' },
  office: { label: 'Office', icon: '🚪', color: '#f59e0b' },
};

export const GlobalSearchModal = ({ open, onClose }: GlobalSearchModalProps) => {
  const workspaceService = useService(WorkspaceService);
  const workbenchService = useService(WorkbenchService);
  const workspaceId = workspaceService.workspace?.id || 'default';

  const [query, setQuery] = useState('');
  const [moduleFilter, setModuleFilter] = useState<WorkspaceModuleType>('all');
  const [results, setResults] = useState<WorkspaceSearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
      performSearch(query, moduleFilter);
    }
  }, [open, moduleFilter]);

  const performSearch = useCallback(
    async (q: string, mod: WorkspaceModuleType) => {
      setLoading(true);
      try {
        const data = await CrossFeatureService.search(workspaceId, q, mod);
        setResults(data.results);
        setSelectedIndex(0);
      } catch (err) {
        console.warn('Search failed:', err);
      } finally {
        setLoading(false);
      }
    },
    [workspaceId]
  );

  const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    performSearch(val, moduleFilter);
  };

  const handleSelectResult = (result: WorkspaceSearchResult) => {
    onClose();
    workbenchService.workbench.open(result.url);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % Math.max(1, results.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev =>
        prev <= 0 ? Math.max(0, results.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      handleSelectResult(results[selectedIndex]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <Modal
      open={open}
      onOpenChange={isOpen => !isOpen && onClose()}
      width={600}
    >
      <div
        onKeyDown={handleKeyDown}
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
          background: 'var(--affine-background-primary-color, #09090b)',
          color: 'var(--affine-text-primary-color)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 20px',
            borderBottom: '1px solid var(--affine-border-color, #27272a)',
          }}
        >
          <span style={{ fontSize: 18, color: 'var(--affine-text-secondary-color)' }}>
            🔍
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search issues, docs, messages, rooms (e.g. 'auth', 'sprint', 'lounge')..."
            value={query}
            onChange={handleQueryChange}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: 15,
              color: 'inherit',
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                performSearch('', moduleFilter);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--affine-text-secondary-color)',
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              Clear
            </button>
          )}
        </div>

        {/* Filter Pills */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: '10px 20px',
            background: 'var(--affine-background-secondary-color, #18181b)',
            borderBottom: '1px solid var(--affine-border-color, #27272a)',
          }}
        >
          {[
            { id: 'all', label: 'All Modules' },
            { id: 'tracker', label: '☑️ Issues' },
            { id: 'docs', label: '📄 Docs' },
            { id: 'chat', label: '💬 Chat' },
            { id: 'office', label: '🚪 Rooms' },
          ].map(tab => (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setModuleFilter(tab.id as WorkspaceModuleType);
              }}
              style={{
                padding: '4px 10px',
                borderRadius: 6,
                border: '1px solid',
                borderColor:
                  moduleFilter === tab.id
                    ? 'var(--affine-primary-color, #3b82f6)'
                    : 'transparent',
                background:
                  moduleFilter === tab.id
                    ? 'rgba(59, 130, 246, 0.15)'
                    : 'transparent',
                color:
                  moduleFilter === tab.id
                    ? 'var(--affine-primary-color, #3b82f6)'
                    : 'var(--affine-text-secondary-color)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Results List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 12px',
            maxHeight: 380,
          }}
        >
          {loading && (
            <div
              style={{
                padding: 24,
                textAlign: 'center',
                color: 'var(--affine-text-secondary-color)',
                fontSize: 13,
              }}
            >
              Searching workspace...
            </div>
          )}

          {!loading && results.length === 0 && (
            <div
              style={{
                padding: '36px 20px',
                textAlign: 'center',
                color: 'var(--affine-text-secondary-color)',
                fontSize: 13,
              }}
            >
              No matching items found for "{query}".
            </div>
          )}

          {!loading &&
            results.map((res, idx) => {
              const isSelected = idx === selectedIndex;
              const meta = MODULE_LABELS[res.module] || {
                label: res.module,
                icon: '📌',
                color: '#3b82f6',
              };

              return (
                <div
                  key={res.id + '-' + idx}
                  onClick={() => handleSelectResult(res)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '10px 14px',
                    borderRadius: 8,
                    background: isSelected
                      ? 'rgba(59, 130, 246, 0.12)'
                      : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 18, marginTop: 2 }}>{meta.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 3,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 600,
                          color: isSelected
                            ? 'var(--affine-primary-color, #3b82f6)'
                            : 'inherit',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {res.title}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '1px 6px',
                          borderRadius: 4,
                          background: `${meta.color}22`,
                          color: meta.color,
                        }}
                      >
                        {meta.label}
                      </span>
                    </div>

                    {res.snippet && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: 'var(--affine-text-secondary-color)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {res.snippet}
                      </p>
                    )}

                    {res.metadata && (
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--affine-text-secondary-color)',
                          opacity: 0.8,
                          display: 'inline-block',
                          marginTop: 2,
                        }}
                      >
                        {res.metadata}
                      </span>
                    )}
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      color: 'var(--affine-text-secondary-color)',
                      opacity: isSelected ? 1 : 0,
                      alignSelf: 'center',
                    }}
                  >
                    Press ↵
                  </span>
                </div>
              );
            })}
        </div>

        {/* Footer Hint */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 18px',
            background: 'var(--affine-background-secondary-color, #18181b)',
            borderTop: '1px solid var(--affine-border-color, #27272a)',
            fontSize: 11,
            color: 'var(--affine-text-secondary-color)',
          }}
        >
          <span>Use ↑ ↓ to navigate</span>
          <span>↵ to open • ESC to close</span>
        </div>
      </div>
    </Modal>
  );
};
