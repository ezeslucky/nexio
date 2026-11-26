import { notify } from '@nexio/component/ui/notification';
import {
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
} from '@nexio/core/modules/workbench';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { useService } from '@toeverything/infra';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { IssueDetailDrawer } from './issue-detail-drawer';
import { IssueListView } from './issue-list-view';
import { KanbanBoard } from './kanban-board';
import { SprintManager } from './sprint-manager';
import { TrackerApiService } from './tracker-service';
import {
  type IssuePriority,
  type IssueStatus,
  TRACKER_COLUMNS,
  type TrackerIssue,
  type TrackerProject,
  type TrackerSprint,
} from './types';

export const Component = () => {
  const workspaceService = useService(WorkspaceService);
  const currentWorkspace = workspaceService.workspace;
  const workspaceId = currentWorkspace.id;

  const [issues, setIssues] = useState<TrackerIssue[]>([]);
  const [projects, setProjects] = useState<TrackerProject[]>([]);
  const [sprints, setSprints] = useState<TrackerSprint[]>([]);
  const [selectedIssue, setSelectedIssue] = useState<TrackerIssue | null>(null);

  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'sprints'>('kanban');
  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | IssuePriority>('all');
  const [sprintFilter, setSprintFilter] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);

  // New Issue form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newStatus, setNewStatus] = useState<IssueStatus>('todo');
  const [newPriority, setNewPriority] = useState<IssuePriority>('medium');
  const [newSprintId, setNewSprintId] = useState('');
  const [newEstimate, setNewEstimate] = useState<number>(3);
  const [newDueDate, setNewDueDate] = useState('');

  // Initial fetch
  useEffect(() => {
    let mounted = true;
    Promise.all([
      TrackerApiService.getIssues(workspaceId).catch(() => []),
      TrackerApiService.getProjects(workspaceId).catch(() => []),
      TrackerApiService.getSprints(workspaceId).catch(() => []),
    ]).then(([issueList, projList, sprintList]) => {
      if (mounted) {
        setIssues(issueList);
        setProjects(projList);
        setSprints(sprintList);
      }
    });
    return () => {
      mounted = false;
    };
  }, [workspaceId]);

  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      if (priorityFilter !== 'all' && issue.priority !== priorityFilter) return false;
      if (sprintFilter !== 'all' && issue.sprintId !== sprintFilter) return false;
      if (search) {
        const query = search.toLowerCase();
        return (
          issue.title.toLowerCase().includes(query) ||
          issue.id.toLowerCase().includes(query) ||
          issue.description?.toLowerCase().includes(query) ||
          issue.labels?.some(l => l.toLowerCase().includes(query))
        );
      }
      return true;
    });
  }, [issues, priorityFilter, sprintFilter, search]);

  const handleCreateIssue = useCallback(async () => {
    if (!newTitle.trim()) return;
    try {
      const created = await TrackerApiService.createIssue(workspaceId, {
        title: newTitle.trim(),
        description: newDescription.trim(),
        status: newStatus,
        priority: newPriority,
        sprintId: newSprintId,
        estimate: newEstimate,
        dueDate: newDueDate,
        assignee: 'Aurobindo Patra',
        reporter: 'Aurobindo Patra',
        labels: ['feature'],
      });
      setIssues(prev => [created, ...prev]);
      setIsCreating(false);
      setNewTitle('');
      setNewDescription('');
      notify.success({
        title: 'Issue Created',
        message: `${created.id}: ${created.title} added to project.`,
      });
    } catch {
      notify.error({ title: 'Error', message: 'Failed to create issue' });
    }
  }, [
    workspaceId,
    newTitle,
    newDescription,
    newStatus,
    newPriority,
    newSprintId,
    newEstimate,
    newDueDate,
  ]);

  const handleStatusChange = useCallback(
    async (issueId: string, targetStatus: IssueStatus) => {
      setIssues(prev =>
        prev.map(i => (i.id === issueId ? { ...i, status: targetStatus } : i))
      );
      if (selectedIssue && selectedIssue.id === issueId) {
        setSelectedIssue(prev => (prev ? { ...prev, status: targetStatus } : null));
      }
      try {
        await TrackerApiService.updateIssue(workspaceId, issueId, { status: targetStatus });
      } catch {
        notify.error({ title: 'Error', message: 'Failed to update issue status' });
      }
    },
    [workspaceId, selectedIssue]
  );

  const handleIssueUpdated = useCallback((updated: TrackerIssue) => {
    setIssues(prev => prev.map(i => (i.id === updated.id ? updated : i)));
    setSelectedIssue(updated);
  }, []);

  const handleIssueDeleted = useCallback((issueId: string) => {
    setIssues(prev => prev.filter(i => i.id !== issueId));
    setSelectedIssue(null);
  }, []);

  return (
    <>
      <ViewHeader>
        <ViewIcon icon="edgeless" />
        <ViewTitle title="Project Tracker" />
      </ViewHeader>
      <ViewBody>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', padding: '24px 32px', boxSizing: 'border-box', overflowY: 'auto' }}>
          {/* Header Controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <input
                type="text"
                placeholder="Search issues, keywords, labels..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: '7px 14px',
                  borderRadius: 8,
                  border: '1px solid var(--affine-border-color, #27272a)',
                  background: 'var(--affine-background-secondary-color, #18181b)',
                  color: 'var(--affine-text-primary-color, #f4f4f5)',
                  fontSize: 13,
                  outline: 'none',
                  minWidth: 260,
                }}
              />

              <select
                value={priorityFilter}
                onChange={e => setPriorityFilter(e.target.value as any)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--affine-border-color, #27272a)',
                  background: 'var(--affine-background-secondary-color, #18181b)',
                  color: 'var(--affine-text-primary-color, #f4f4f5)',
                  fontSize: 13,
                  outline: 'none',
                }}
              >
                <option value="all">All Priorities</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>

              <select
                value={sprintFilter}
                onChange={e => setSprintFilter(e.target.value)}
                style={{
                  padding: '7px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--affine-border-color, #27272a)',
                  background: 'var(--affine-background-secondary-color, #18181b)',
                  color: 'var(--affine-text-primary-color, #f4f4f5)',
                  fontSize: 13,
                  outline: 'none',
                }}
              >
                <option value="all">All Sprints</option>
                {sprints.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {/* View Switcher Tabs */}
              <div
                style={{
                  display: 'inline-flex',
                  background: 'var(--affine-background-secondary-color, #18181b)',
                  borderRadius: 8,
                  padding: 3,
                  border: '1px solid var(--affine-border-color, #27272a)',
                }}
              >
                {(['kanban', 'list', 'sprints'] as const).map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setViewMode(tab)}
                    style={{
                      padding: '5px 14px',
                      borderRadius: 6,
                      border: 'none',
                      background: viewMode === tab ? 'var(--affine-primary-color, #3b82f6)' : 'transparent',
                      color: viewMode === tab ? '#fff' : 'var(--affine-text-secondary-color, #a1a1aa)',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsCreating(true)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--affine-primary-color, #3b82f6)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>+</span> New Issue
              </button>
            </div>
          </div>

          {/* Quick Issue Creator Form */}
          {isCreating && (
            <div
              style={{
                background: 'var(--affine-background-secondary-color, #18181b)',
                border: '1px solid var(--affine-border-color, #27272a)',
                borderRadius: 12,
                padding: 18,
                marginBottom: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 14 }}>Create Issue in Core Product</div>
              <input
                type="text"
                placeholder="Issue title..."
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                style={{
                  padding: '9px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--affine-border-color, #27272a)',
                  background: 'var(--affine-background-primary-color, #09090b)',
                  color: 'var(--affine-text-primary-color, #f4f4f5)',
                  fontSize: 13,
                  outline: 'none',
                }}
              />
              <textarea
                placeholder="Description / requirements (optional)..."
                rows={2}
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px solid var(--affine-border-color, #27272a)',
                  background: 'var(--affine-background-primary-color, #09090b)',
                  color: 'var(--affine-text-primary-color, #f4f4f5)',
                  fontSize: 12,
                  outline: 'none',
                  resize: 'none',
                }}
              />
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value as any)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--affine-border-color, #27272a)',
                    background: 'var(--affine-background-primary-color, #09090b)',
                    color: 'var(--affine-text-primary-color, #f4f4f5)',
                    fontSize: 12,
                  }}
                >
                  {TRACKER_COLUMNS.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>

                <select
                  value={newPriority}
                  onChange={e => setNewPriority(e.target.value as any)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--affine-border-color, #27272a)',
                    background: 'var(--affine-background-primary-color, #09090b)',
                    color: 'var(--affine-text-primary-color, #f4f4f5)',
                    fontSize: 12,
                  }}
                >
                  <option value="urgent">🔴 Urgent</option>
                  <option value="high">🟠 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🔵 Low</option>
                  <option value="none">⚪ None</option>
                </select>

                <select
                  value={newSprintId}
                  onChange={e => setNewSprintId(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--affine-border-color, #27272a)',
                    background: 'var(--affine-background-primary-color, #09090b)',
                    color: 'var(--affine-text-primary-color, #f4f4f5)',
                    fontSize: 12,
                  }}
                >
                  <option value="">No Sprint (Backlog)</option>
                  {sprints.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  placeholder="Points"
                  min={0}
                  max={50}
                  value={newEstimate}
                  onChange={e => setNewEstimate(parseInt(e.target.value, 10) || 0)}
                  style={{
                    width: 70,
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
                  value={newDueDate}
                  onChange={e => setNewDueDate(e.target.value)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--affine-border-color, #27272a)',
                    background: 'var(--affine-background-primary-color, #09090b)',
                    color: 'var(--affine-text-primary-color, #f4f4f5)',
                    fontSize: 12,
                  }}
                />

                <div style={{ flex: 1 }} />
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: '1px solid var(--affine-border-color, #27272a)',
                    background: 'transparent',
                    color: 'var(--affine-text-secondary-color, #a1a1aa)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleCreateIssue}
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
                  Save Issue
                </button>
              </div>
            </div>
          )}

          {/* Main View Container */}
          {viewMode === 'kanban' ? (
            <KanbanBoard
              issues={filteredIssues}
              onSelectIssue={setSelectedIssue}
              onStatusChange={handleStatusChange}
            />
          ) : viewMode === 'list' ? (
            <IssueListView
              issues={filteredIssues}
              onSelectIssue={setSelectedIssue}
              onStatusChange={handleStatusChange}
            />
          ) : (
            <SprintManager
              workspaceId={workspaceId}
              sprints={sprints}
              issues={issues}
              onSprintUpdated={s => setSprints(prev => prev.map(x => (x.id === s.id ? s : x)))}
              onSprintCreated={s => setSprints(prev => [...prev, s])}
              onSelectIssue={setSelectedIssue}
            />
          )}

          {/* Slide-over Issue Detail Drawer */}
          <IssueDetailDrawer
            workspaceId={workspaceId}
            issue={selectedIssue}
            sprints={sprints}
            onClose={() => setSelectedIssue(null)}
            onUpdate={handleIssueUpdated}
            onDelete={handleIssueDeleted}
          />
        </div>
      </ViewBody>
    </>
  );
};
