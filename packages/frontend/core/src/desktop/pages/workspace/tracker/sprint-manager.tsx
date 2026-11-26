import { notify } from '@nexio/component/ui/notification';
import { useCallback, useState } from 'react';

import { TrackerApiService } from './tracker-service';
import type { TrackerIssue, TrackerSprint } from './types';

interface SprintManagerProps {
  workspaceId: string;
  sprints: TrackerSprint[];
  issues: TrackerIssue[];
  onSprintUpdated: (sprint: TrackerSprint) => void;
  onSprintCreated: (sprint: TrackerSprint) => void;
  onSelectIssue: (issue: TrackerIssue) => void;
}

export const SprintManager = ({
  workspaceId,
  sprints,
  issues,
  onSprintUpdated,
  onSprintCreated,
  onSelectIssue,
}: SprintManagerProps) => {
  const [isCreatingSprint, setIsCreatingSprint] = useState(false);
  const [newSprintName, setNewSprintName] = useState('');
  const [newSprintGoal, setNewSprintGoal] = useState('');
  const [newSprintStart, setNewSprintStart] = useState('');
  const [newSprintEnd, setNewSprintEnd] = useState('');

  const handleCreateSprint = useCallback(async () => {
    if (!newSprintName.trim()) return;
    try {
      const created = await TrackerApiService.createSprint(workspaceId, {
        name: newSprintName.trim(),
        goal: newSprintGoal.trim(),
        startDate: newSprintStart || new Date().toISOString().split('T')[0],
        endDate: newSprintEnd || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
        status: 'planned',
        projectId: 'proj-core',
      });
      onSprintCreated(created);
      setIsCreatingSprint(false);
      setNewSprintName('');
      setNewSprintGoal('');
      notify.success({ title: 'Sprint Created', message: `${created.name} is ready.` });
    } catch {
      notify.error({ title: 'Error', message: 'Failed to create sprint' });
    }
  }, [newSprintName, newSprintGoal, newSprintStart, newSprintEnd, workspaceId, onSprintCreated]);

  const handleToggleSprintStatus = useCallback(
    async (sprint: TrackerSprint) => {
      const nextStatus = sprint.status === 'planned' ? 'active' : 'completed';
      try {
        const updated = await TrackerApiService.updateSprint(workspaceId, sprint.id, {
          status: nextStatus,
        });
        onSprintUpdated(updated);
        notify.success({
          title: 'Sprint Updated',
          message: `${sprint.name} marked as ${nextStatus}.`,
        });
      } catch {
        notify.error({ title: 'Error', message: 'Failed to update sprint status' });
      }
    },
    [workspaceId, onSprintUpdated]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Top action row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>Sprints & Milestones</div>
          <div style={{ fontSize: 12, color: 'var(--affine-text-secondary-color, #a1a1aa)', marginTop: 2 }}>
            Organize work into 2-week agile sprints, track velocity and milestone goals.
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsCreatingSprint(true)}
          style={{
            padding: '7px 14px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--affine-primary-color, #3b82f6)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Create Sprint
        </button>
      </div>

      {/* New Sprint Modal */}
      {isCreatingSprint && (
        <div
          style={{
            background: 'var(--affine-background-secondary-color, #18181b)',
            borderRadius: 12,
            border: '1px solid var(--affine-border-color, #27272a)',
            padding: 16,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontWeight: 600, fontSize: 14 }}>Create New Sprint</div>
          <input
            type="text"
            placeholder="Sprint Name (e.g. Sprint 2: Realtime Chat Sync)"
            value={newSprintName}
            onChange={e => setNewSprintName(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--affine-border-color, #27272a)',
              background: 'var(--affine-background-primary-color, #09090b)',
              color: 'var(--affine-text-primary-color, #f4f4f5)',
              fontSize: 13,
            }}
          />
          <input
            type="text"
            placeholder="Sprint Goal (optional)"
            value={newSprintGoal}
            onChange={e => setNewSprintGoal(e.target.value)}
            style={{
              padding: '8px 12px',
              borderRadius: 8,
              border: '1px solid var(--affine-border-color, #27272a)',
              background: 'var(--affine-background-primary-color, #09090b)',
              color: 'var(--affine-text-primary-color, #f4f4f5)',
              fontSize: 13,
            }}
          />
          <div style={{ display: 'flex', gap: 12 }}>
            <input
              type="date"
              value={newSprintStart}
              onChange={e => setNewSprintStart(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid var(--affine-border-color, #27272a)',
                background: 'var(--affine-background-primary-color, #09090b)',
                color: 'var(--affine-text-primary-color, #f4f4f5)',
                fontSize: 12,
              }}
            />
            <input
              type="date"
              value={newSprintEnd}
              onChange={e => setNewSprintEnd(e.target.value)}
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid var(--affine-border-color, #27272a)',
                background: 'var(--affine-background-primary-color, #09090b)',
                color: 'var(--affine-text-primary-color, #f4f4f5)',
                fontSize: 12,
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button
              type="button"
              onClick={() => setIsCreatingSprint(false)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                background: 'transparent',
                border: '1px solid var(--affine-border-color, #27272a)',
                color: 'var(--affine-text-secondary-color, #a1a1aa)',
                fontSize: 12,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleCreateSprint}
              style={{
                padding: '6px 16px',
                borderRadius: 6,
                background: 'var(--affine-primary-color, #3b82f6)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Save Sprint
            </button>
          </div>
        </div>
      )}

      {/* Sprints list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {sprints.map(sprint => {
          const sprintIssues = issues.filter(i => i.sprintId === sprint.id);
          const doneCount = sprintIssues.filter(i => i.status === 'done').length;
          const totalPoints = sprintIssues.reduce((acc, curr) => acc + (curr.estimate || 0), 0);
          const donePoints = sprintIssues
            .filter(i => i.status === 'done')
            .reduce((acc, curr) => acc + (curr.estimate || 0), 0);
          const pct = sprintIssues.length > 0 ? Math.round((doneCount / sprintIssues.length) * 100) : 0;

          return (
            <div
              key={sprint.id}
              style={{
                background: 'var(--affine-background-secondary-color, #18181b)',
                borderRadius: 12,
                border: '1px solid var(--affine-border-color, #27272a)',
                padding: 16,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 700, fontSize: 15 }}>{sprint.name}</span>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 8px',
                        borderRadius: 6,
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        background:
                          sprint.status === 'active'
                            ? '#10b98122'
                            : sprint.status === 'completed'
                            ? '#3b82f622'
                            : '#64748b22',
                        color:
                          sprint.status === 'active'
                            ? '#10b981'
                            : sprint.status === 'completed'
                            ? '#3b82f6'
                            : '#94a3b8',
                      }}
                    >
                      {sprint.status}
                    </span>
                  </div>
                  {sprint.goal && (
                    <div style={{ fontSize: 12, color: 'var(--affine-text-secondary-color, #a1a1aa)', marginTop: 4 }}>
                      🎯 Goal: {sprint.goal}
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 12, textAlign: 'right' }}>
                    <div style={{ fontWeight: 600 }}>
                      {doneCount}/{sprintIssues.length} issues completed ({pct}%)
                    </div>
                    <div style={{ color: 'var(--affine-text-secondary-color, #a1a1aa)', fontSize: 11 }}>
                      {donePoints}/{totalPoints} story points
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggleSprintStatus(sprint)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 6,
                      border: '1px solid var(--affine-border-color, #27272a)',
                      background: 'var(--affine-background-primary-color, #09090b)',
                      color: 'var(--affine-text-primary-color, #f4f4f5)',
                      fontSize: 12,
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
                  >
                    {sprint.status === 'planned' ? 'Start Sprint' : sprint.status === 'active' ? 'Complete' : 'Reopen'}
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  height: 6,
                  borderRadius: 3,
                  background: 'var(--affine-background-primary-color, #09090b)',
                  overflow: 'hidden',
                  marginBottom: 14,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${pct}%`,
                    background: '#10b981',
                    borderRadius: 3,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>

              {/* Issues in sprint */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {sprintIssues.map(issue => (
                  <div
                    key={issue.id}
                    onClick={() => onSelectIssue(issue)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 6,
                      background: 'var(--affine-background-primary-color, #09090b)',
                      border: '1px solid var(--affine-border-color, #27272a)',
                      cursor: 'pointer',
                      fontSize: 13,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--affine-primary-color, #3b82f6)' }}>
                        {issue.id}
                      </span>
                      <span>{issue.title}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'rgba(255,255,255,0.06)',
                        }}
                      >
                        {issue.status}
                      </span>
                      {issue.estimate > 0 && (
                        <span style={{ fontSize: 11, color: 'var(--affine-text-secondary-color, #a1a1aa)' }}>
                          {issue.estimate} pts
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
