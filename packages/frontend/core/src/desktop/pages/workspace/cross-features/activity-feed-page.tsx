import {
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
} from '@nexio/core/modules/workbench';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { useService } from '@toeverything/infra';
import { useCallback, useEffect, useState } from 'react';

import { CrossFeatureService } from './cross-feature-service';
import type { WorkspaceActivityItem, WorkspaceModuleType } from './types';

const MODULE_STYLES: Record<
  string,
  { label: string; icon: string; color: string }
> = {
  tracker: { label: 'Issue Tracker', icon: '☑️', color: '#3b82f6' },
  docs: { label: 'Document', icon: '📄', color: '#10b981' },
  chat: { label: 'Channel & Chat', icon: '💬', color: '#8b5cf6' },
  office: { label: 'Virtual Office', icon: '🚪', color: '#f59e0b' },
};

export const Component = () => {
  const workspaceService = useService(WorkspaceService);
  const workspaceId = workspaceService.workspace?.id || 'default';

  const [activities, setActivities] = useState<WorkspaceActivityItem[]>([]);
  const [filter, setFilter] = useState<WorkspaceModuleType>('all');
  const [loading, setLoading] = useState(false);

  const fetchActivities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CrossFeatureService.getActivityFeed(workspaceId);
      setActivities(data.activities);
    } catch (err) {
      console.warn('Failed to load activity feed:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchActivities();
    const interval = setInterval(fetchActivities, 5000);
    return () => clearInterval(interval);
  }, [fetchActivities]);

  const filteredActivities = activities.filter(a => {
    if (filter === 'all') return true;
    return a.module === filter;
  });

  return (
    <>
      <ViewHeader>
        <ViewIcon icon="allDocs" />
        <ViewTitle title="Workspace Activity Feed" />
      </ViewHeader>

      <ViewBody>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            padding: '24px 32px',
            boxSizing: 'border-box',
            overflowY: 'auto',
          }}
        >
          {/* Header Banner */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderRadius: 14,
              background:
                'linear-gradient(135deg, rgba(59,130,246,0.1) 0%, rgba(16,185,129,0.1) 100%)',
              border: '1px solid var(--affine-border-color, #27272a)',
              marginBottom: 24,
            }}
          >
            <div>
              <h1 style={{ margin: '0 0 6px 0', fontSize: 18, fontWeight: 700 }}>
                Unified Activity Stream
              </h1>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: 'var(--affine-text-secondary-color, #a1a1aa)',
                }}
              >
                Track live workspace updates across Tracker issues, collaborative docs, channels, and virtual office presence.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchActivities}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid var(--affine-border-color, #27272a)',
                background: 'var(--affine-background-secondary-color, #18181b)',
                color: 'inherit',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              ↻ Refresh Feed
            </button>
          </div>

          {/* Module Filter Tabs */}
          <div
            style={{
              display: 'flex',
              gap: 8,
              marginBottom: 20,
            }}
          >
            {[
              { id: 'all', label: 'All Activities' },
              { id: 'tracker', label: '☑️ Tracker' },
              { id: 'docs', label: '📄 Documents' },
              { id: 'chat', label: '💬 Channels' },
              { id: 'office', label: '🚪 Virtual Office' },
            ].map(tab => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilter(tab.id as WorkspaceModuleType)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  border: '1px solid',
                  borderColor:
                    filter === tab.id
                      ? 'var(--affine-primary-color, #3b82f6)'
                      : 'var(--affine-border-color, #27272a)',
                  background:
                    filter === tab.id
                      ? 'rgba(59, 130, 246, 0.12)'
                      : 'var(--affine-background-secondary-color, #18181b)',
                  color:
                    filter === tab.id
                      ? 'var(--affine-primary-color, #3b82f6)'
                      : 'var(--affine-text-secondary-color, #a1a1aa)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Timeline Stream */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              maxWidth: 800,
            }}
          >
            {loading && activities.length === 0 && (
              <div style={{ color: 'var(--affine-text-secondary-color)', fontSize: 13, padding: 20 }}>
                Loading activity feed...
              </div>
            )}

            {!loading && filteredActivities.length === 0 && (
              <div style={{ color: 'var(--affine-text-secondary-color)', fontSize: 13, padding: 20 }}>
                No activities found for this filter.
              </div>
            )}

            {filteredActivities.map(item => {
              const meta = MODULE_STYLES[item.module] || {
                label: item.module,
                icon: '📌',
                color: '#3b82f6',
              };

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 14,
                    padding: '16px 20px',
                    borderRadius: 12,
                    background: 'var(--affine-background-secondary-color, #18181b)',
                    border: '1px solid var(--affine-border-color, #27272a)',
                  }}
                >
                  {/* Actor Avatar */}
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: `${meta.color}33`,
                      color: meta.color,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 14,
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {item.actorName.slice(0, 1).toUpperCase()}
                  </div>

                  {/* Content */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 700 }}>
                        {item.actorName}
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: `${meta.color}22`,
                          color: meta.color,
                        }}
                      >
                        {meta.label}
                      </span>
                      <span
                        style={{
                          fontSize: 11,
                          color: 'var(--affine-text-secondary-color)',
                          marginLeft: 'auto',
                        }}
                      >
                        {new Date(item.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <a
                      href={item.targetUrl}
                      style={{
                        display: 'block',
                        fontSize: 14,
                        fontWeight: 600,
                        color: 'inherit',
                        textDecoration: 'none',
                        marginBottom: item.details ? 4 : 0,
                      }}
                    >
                      {item.targetTitle}
                    </a>

                    {item.details && (
                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          color: 'var(--affine-text-secondary-color)',
                          lineHeight: 1.4,
                        }}
                      >
                        {item.details}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </ViewBody>
    </>
  );
};
