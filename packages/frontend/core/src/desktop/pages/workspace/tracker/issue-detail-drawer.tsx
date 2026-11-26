import { notify } from '@nexio/component/ui/notification';
import { useCallback, useEffect, useState } from 'react';

import {
  calculateEstimateProgress,
  formatDuration,
  formatTimerSeconds,
} from './time-utils';
import { TrackerApiService } from './tracker-service';
import {
  type IssuePriority,
  type IssueStatus,
  TRACKER_COLUMNS,
  type TrackerGitHubLink,
  type TrackerIssue,
  type TrackerSprint,
  type TrackerTimeLog,
} from './types';

interface IssueDetailDrawerProps {
  workspaceId: string;
  issue: TrackerIssue | null;
  sprints: TrackerSprint[];
  onClose: () => void;
  onUpdate: (updated: TrackerIssue) => void;
  onDelete: (issueId: string) => void;
}

export const IssueDetailDrawer = ({
  workspaceId,
  issue,
  sprints,
  onClose,
  onUpdate,
  onDelete,
}: IssueDetailDrawerProps) => {
  if (!issue) return null;

  const [title, setTitle] = useState(issue.title);
  const [description, setDescription] = useState(issue.description || '');
  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [priority, setPriority] = useState<IssuePriority>(issue.priority);
  const [assignee, setAssignee] = useState(issue.assignee || 'Unassigned');
  const [sprintId, setSprintId] = useState(issue.sprintId || '');
  const [estimate, setEstimate] = useState<number>(issue.estimate || 0);
  const [dueDate, setDueDate] = useState(issue.dueDate || '');
  const [linkedDocIds, setLinkedDocIds] = useState<string[]>(issue.linkedDocIds || ['default-doc']);
  const [commentText, setCommentText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [timeLogs, setTimeLogs] = useState<TrackerTimeLog[]>(issue.timeLogs || []);
  const [totalSpentMinutes, setTotalSpentMinutes] = useState<number>(
    issue.totalSpentMinutes || (issue.timeLogs ? issue.timeLogs.reduce((acc, l) => acc + l.timeSpentMinutes, 0) : 0)
  );
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [logMinutesInput, setLogMinutesInput] = useState('');
  const [logDescInput, setLogDescInput] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);
  const [isLoggingTime, setIsLoggingTime] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  useEffect(() => {
    TrackerApiService.getIssueTimeLogs(workspaceId, issue.id)
      .then(logs => {
        if (logs && logs.length > 0) {
          setTimeLogs(logs);
          const sum = logs.reduce((acc, l) => acc + l.timeSpentMinutes, 0);
          setTotalSpentMinutes(sum);
        }
      })
      .catch(() => {});
  }, [workspaceId, issue.id]);

  const handleLogTime = useCallback(
    async (minutes: number, description: string) => {
      if (minutes <= 0) return;
      setIsLoggingTime(true);
      try {
        const newLog = await TrackerApiService.logIssueTime(workspaceId, issue.id, {
          timeSpentMinutes: minutes,
          description: description || 'Work on task',
          userName: 'Aurobindo Patra',
        });
        const updatedLogs = [newLog, ...timeLogs];
        const newTotal = totalSpentMinutes + minutes;
        setTimeLogs(updatedLogs);
        setTotalSpentMinutes(newTotal);
        setLogMinutesInput('');
        setLogDescInput('');
        setShowLogForm(false);
        onUpdate({
          ...issue,
          timeLogs: updatedLogs,
          totalSpentMinutes: newTotal,
        });
        notify.success({ title: 'Time Logged', message: `Logged ${minutes}m on ${issue.id}.` });
      } catch {
        notify.error({ title: 'Error', message: 'Failed to log time' });
      } finally {
        setIsLoggingTime(false);
      }
    },
    [workspaceId, issue, timeLogs, totalSpentMinutes, onUpdate]
  );

  const handleStopwatchLog = useCallback(() => {
    const elapsedMinutes = Math.max(1, Math.round(timerSeconds / 60));
    setIsTimerRunning(false);
    setTimerSeconds(0);
    handleLogTime(elapsedMinutes, 'Logged via Live Stopwatch');
  }, [timerSeconds, handleLogTime]);

  const [githubLinks, setGithubLinks] = useState<TrackerGitHubLink[]>(issue.githubLinks || []);

  useEffect(() => {
    TrackerApiService.getIssueGitHubLinks(workspaceId, issue.id)
      .then(links => {
        if (links && links.length > 0) {
          setGithubLinks(links);
        }
      })
      .catch(() => {});
  }, [workspaceId, issue.id]);

  const handleAddGitHubLink = useCallback(async () => {
    const url = prompt('Enter GitHub Pull Request or Commit URL:');
    if (!url?.trim()) return;
    const title = prompt('Enter Title or Commit summary:') || url.trim();
    const isPR = url.includes('/pull/');
    try {
      const newLink = await TrackerApiService.linkGitHubItem(workspaceId, issue.id, {
        type: isPR ? 'pull_request' : 'commit',
        title,
        url: url.trim(),
        status: isPR ? 'open' : undefined,
        author: 'Aurobindo Patra',
      });
      const updated = [newLink, ...githubLinks];
      setGithubLinks(updated);
      onUpdate({ ...issue, githubLinks: updated });
      notify.success({ title: 'GitHub Item Linked', message: 'Linked to tracker issue.' });
    } catch {
      notify.error({ title: 'Error', message: 'Failed to link GitHub item' });
    }
  }, [workspaceId, issue, githubLinks, onUpdate]);

  const handleLinkDoc = useCallback(
    (docId: string) => {
      if (!docId.trim()) return;
      const next = Array.from(new Set([...linkedDocIds, docId.trim()]));
      setLinkedDocIds(next);
      handleSaveField({ linkedDocIds: next });
    },
    [linkedDocIds, handleSaveField]
  );

  const handleUnlinkDoc = useCallback(
    (docId: string) => {
      const next = linkedDocIds.filter(d => d !== docId);
      setLinkedDocIds(next);
      handleSaveField({ linkedDocIds: next });
    },
    [linkedDocIds, handleSaveField]
  );

  const handleSaveField = useCallback(
    async (field: Partial<TrackerIssue>) => {
      try {
        const updated = await TrackerApiService.updateIssue(workspaceId, issue.id, field);
        onUpdate(updated);
      } catch {
        notify.error({ title: 'Error', message: 'Failed to update issue' });
      }
    },
    [workspaceId, issue.id, onUpdate]
  );

  const handleAddComment = useCallback(async () => {
    if (!commentText.trim()) return;
    setIsSaving(true);
    try {
      const newComment = await TrackerApiService.addComment(
        workspaceId,
        issue.id,
        commentText.trim(),
        'Aurobindo Patra'
      );
      const updated: TrackerIssue = {
        ...issue,
        comments: [...(issue.comments || []), newComment],
      };
      onUpdate(updated);
      setCommentText('');
      notify.success({ title: 'Comment Posted', message: 'Your comment was added.' });
    } catch {
      notify.error({ title: 'Error', message: 'Failed to post comment' });
    } finally {
      setIsSaving(false);
    }
  }, [commentText, workspaceId, issue, onUpdate]);

  const handleDelete = useCallback(async () => {
    if (!confirm(`Delete ${issue.id}: ${issue.title}?`)) return;
    try {
      await TrackerApiService.deleteIssue(workspaceId, issue.id);
      onDelete(issue.id);
      onClose();
      notify.success({ title: 'Issue Deleted', message: `${issue.id} removed.` });
    } catch {
      notify.error({ title: 'Error', message: 'Failed to delete issue' });
    }
  }, [workspaceId, issue, onDelete, onClose]);

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: 520,
        maxWidth: '90vw',
        background: 'var(--affine-background-primary-color, #18181b)',
        borderLeft: '1px solid var(--affine-border-color, #27272a)',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.4)',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        animation: 'slideIn 0.2s ease',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px',
          borderBottom: '1px solid var(--affine-border-color, #27272a)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: 'var(--affine-primary-color, #3b82f6)',
              background: 'rgba(59, 130, 246, 0.1)',
              padding: '3px 8px',
              borderRadius: 6,
            }}
          >
            {issue.id}
          </span>
          <span style={{ fontSize: 12, color: 'var(--affine-text-secondary-color, #a1a1aa)' }}>
            Created {issue.createdAt?.split('T')[0]}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onClick={handleDelete}
            style={{
              padding: '5px 10px',
              background: 'transparent',
              border: 'none',
              color: '#ef4444',
              cursor: 'pointer',
              fontSize: 12,
              borderRadius: 6,
            }}
          >
            Delete
          </button>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '5px 10px',
              background: 'transparent',
              border: 'none',
              color: 'var(--affine-text-secondary-color, #a1a1aa)',
              cursor: 'pointer',
              fontSize: 16,
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Body scroll area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* Title input */}
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          onBlur={() => handleSaveField({ title })}
          placeholder="Issue title"
          style={{
            fontSize: 18,
            fontWeight: 700,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--affine-text-primary-color, #f4f4f5)',
            width: '100%',
          }}
        />

        {/* Properties Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr',
            rowGap: 12,
            columnGap: 16,
            alignItems: 'center',
            fontSize: 13,
            background: 'var(--affine-background-secondary-color, #27272a)',
            padding: 16,
            borderRadius: 10,
          }}
        >
          <span style={{ color: 'var(--affine-text-secondary-color, #a1a1aa)' }}>Status</span>
          <select
            value={status}
            onChange={e => {
              const val = e.target.value as IssueStatus;
              setStatus(val);
              handleSaveField({ status: val });
            }}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              background: 'var(--affine-background-primary-color, #18181b)',
              border: '1px solid var(--affine-border-color, #3f3f46)',
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

          <span style={{ color: 'var(--affine-text-secondary-color, #a1a1aa)' }}>Priority</span>
          <select
            value={priority}
            onChange={e => {
              const val = e.target.value as IssuePriority;
              setPriority(val);
              handleSaveField({ priority: val });
            }}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              background: 'var(--affine-background-primary-color, #18181b)',
              border: '1px solid var(--affine-border-color, #3f3f46)',
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

          <span style={{ color: 'var(--affine-text-secondary-color, #a1a1aa)' }}>Assignee</span>
          <select
            value={assignee}
            onChange={e => {
              setAssignee(e.target.value);
              handleSaveField({ assignee: e.target.value });
            }}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              background: 'var(--affine-background-primary-color, #18181b)',
              border: '1px solid var(--affine-border-color, #3f3f46)',
              color: 'var(--affine-text-primary-color, #f4f4f5)',
              fontSize: 12,
            }}
          >
            <option value="Aurobindo Patra">Aurobindo Patra (Owner)</option>
            <option value="Unassigned">Unassigned</option>
          </select>

          <span style={{ color: 'var(--affine-text-secondary-color, #a1a1aa)' }}>Sprint</span>
          <select
            value={sprintId}
            onChange={e => {
              setSprintId(e.target.value);
              handleSaveField({ sprintId: e.target.value });
            }}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              background: 'var(--affine-background-primary-color, #18181b)',
              border: '1px solid var(--affine-border-color, #3f3f46)',
              color: 'var(--affine-text-primary-color, #f4f4f5)',
              fontSize: 12,
            }}
          >
            <option value="">No Sprint (Backlog)</option>
            {sprints.map(s => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
          </select>

          <span style={{ color: 'var(--affine-text-secondary-color, #a1a1aa)' }}>Estimate (Pts)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={estimate}
            onChange={e => {
              const val = parseInt(e.target.value, 10) || 0;
              setEstimate(val);
              handleSaveField({ estimate: val });
            }}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              background: 'var(--affine-background-primary-color, #18181b)',
              border: '1px solid var(--affine-border-color, #3f3f46)',
              color: 'var(--affine-text-primary-color, #f4f4f5)',
              fontSize: 12,
              width: 80,
            }}
          />

          <span style={{ color: 'var(--affine-text-secondary-color, #a1a1aa)' }}>Due Date</span>
          <input
            type="date"
            value={dueDate}
            onChange={e => {
              setDueDate(e.target.value);
              handleSaveField({ dueDate: e.target.value });
            }}
            style={{
              padding: '5px 10px',
              borderRadius: 6,
              background: 'var(--affine-background-primary-color, #18181b)',
              border: '1px solid var(--affine-border-color, #3f3f46)',
              color: 'var(--affine-text-primary-color, #f4f4f5)',
              fontSize: 12,
            }}
          />
        </div>

        {/* Description */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>Description</div>
          <textarea
            rows={5}
            value={description}
            onChange={e => setDescription(e.target.value)}
            onBlur={() => handleSaveField({ description })}
            placeholder="Add detailed description or acceptance criteria..."
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 8,
              border: '1px solid var(--affine-border-color, #27272a)',
              background: 'var(--affine-background-secondary-color, #27272a)',
              color: 'var(--affine-text-primary-color, #f4f4f5)',
              fontSize: 13,
              fontFamily: 'inherit',
              lineHeight: 1.5,
              resize: 'vertical',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
        </div>

        {/* Linked Collaborative Documents */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Linked Documents (Phase 4)</div>
            <button
              type="button"
              onClick={() => {
                const docId = prompt('Enter Document ID or Title to link:');
                if (docId) handleLinkDoc(docId);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--affine-primary-color, #3b82f6)',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              + Link Document
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {linkedDocIds.length === 0 ? (
              <span style={{ fontSize: 12, color: '#71717a' }}>No collaborative documents linked.</span>
            ) : (
              linkedDocIds.map(docId => (
                <div
                  key={docId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 6,
                    backgroundColor: 'rgba(59, 130, 246, 0.15)',
                    border: '1px solid rgba(59, 130, 246, 0.3)',
                    fontSize: 12,
                    color: '#93c5fd',
                  }}
                >
                  <a
                    href={`/workspace/${workspaceId}/all?docId=${docId}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#93c5fd', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                  >
                    <span>📄</span>
                    <span style={{ fontWeight: 500 }}>
                      {docId === 'default-doc' ? 'Sprint 1 Specs & Architecture' : docId}
                    </span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handleUnlinkDoc(docId)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#93c5fd',
                      cursor: 'pointer',
                      fontSize: 12,
                      padding: 0,
                      marginLeft: 4,
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Time Tracking & Worklogs (Huly Parity) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginTop: 4,
            padding: 16,
            borderRadius: 10,
            background: 'var(--affine-background-secondary-color, #27272a)',
            border: '1px solid var(--affine-border-color, #3f3f46)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>⏱️</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>Time Tracking</span>
            </div>
            <button
              type="button"
              onClick={() => setShowLogForm(!showLogForm)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--affine-primary-color, #3b82f6)',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {showLogForm ? 'Cancel' : '+ Log Work'}
            </button>
          </div>

          {/* Progress & Summary Bar */}
          <div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 12,
                marginBottom: 6,
                color: 'var(--affine-text-secondary-color, #a1a1aa)',
              }}
            >
              <span>
                Spent: <strong style={{ color: 'var(--affine-text-primary-color, #f4f4f5)' }}>{formatDuration(totalSpentMinutes)}</strong>
              </span>
              <span>
                Estimate: <strong style={{ color: 'var(--affine-text-primary-color, #f4f4f5)' }}>{estimate > 0 ? `${estimate}h` : 'None'}</strong>
              </span>
            </div>
            <div
              style={{
                width: '100%',
                height: 8,
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${estimate > 0 ? Math.min(100, Math.round((totalSpentMinutes / (estimate * 60)) * 100)) : totalSpentMinutes > 0 ? 100 : 0}%`,
                  background:
                    estimate > 0 && totalSpentMinutes > estimate * 60
                      ? '#ef4444'
                      : 'var(--affine-primary-color, #3b82f6)',
                  borderRadius: 4,
                  transition: 'width 0.3s ease',
                }}
              />
            </div>
          </div>

          {/* Live Stopwatch Tracker */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--affine-background-primary-color, #18181b)',
              padding: '10px 14px',
              borderRadius: 8,
              border: '1px solid var(--affine-border-color, #3f3f46)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span
                style={{
                  fontFamily: 'monospace',
                  fontSize: 16,
                  fontWeight: 700,
                  color: isTimerRunning ? '#10b981' : 'var(--affine-text-primary-color, #f4f4f5)',
                }}
              >
                {formatTimerSeconds(timerSeconds)}
              </span>
              {isTimerRunning && (
                <span style={{ fontSize: 11, color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                  Tracking
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                style={{
                  padding: '5px 10px',
                  borderRadius: 6,
                  border: 'none',
                  background: isTimerRunning ? '#eab308' : '#10b981',
                  color: '#000',
                  fontWeight: 600,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                {isTimerRunning ? 'Pause' : timerSeconds > 0 ? 'Resume' : 'Start Timer'}
              </button>

              {timerSeconds > 0 && (
                <>
                  <button
                    type="button"
                    onClick={handleStopwatchLog}
                    style={{
                      padding: '5px 10px',
                      borderRadius: 6,
                      border: 'none',
                      background: 'var(--affine-primary-color, #3b82f6)',
                      color: '#fff',
                      fontWeight: 600,
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    Log Time
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsTimerRunning(false);
                      setTimerSeconds(0);
                    }}
                    style={{
                      padding: '5px 8px',
                      borderRadius: 6,
                      border: 'none',
                      background: 'transparent',
                      color: '#a1a1aa',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Manual Log Input Form */}
          {showLogForm && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                background: 'var(--affine-background-primary-color, #18181b)',
                padding: 12,
                borderRadius: 8,
                border: '1px solid var(--affine-border-color, #3f3f46)',
              }}
            >
              <div style={{ fontSize: 12, fontWeight: 600 }}>Log Spent Time</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="number"
                  min={1}
                  placeholder="Minutes (e.g. 45)"
                  value={logMinutesInput}
                  onChange={e => setLogMinutesInput(e.target.value)}
                  style={{
                    width: 120,
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--affine-border-color, #3f3f46)',
                    background: 'var(--affine-background-secondary-color, #27272a)',
                    color: 'var(--affine-text-primary-color, #f4f4f5)',
                    fontSize: 12,
                  }}
                />
                <input
                  type="text"
                  placeholder="Work description (optional)"
                  value={logDescInput}
                  onChange={e => setLogDescInput(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 10px',
                    borderRadius: 6,
                    border: '1px solid var(--affine-border-color, #3f3f46)',
                    background: 'var(--affine-background-secondary-color, #27272a)',
                    color: 'var(--affine-text-primary-color, #f4f4f5)',
                    fontSize: 12,
                  }}
                />
                <button
                  type="button"
                  disabled={isLoggingTime || !logMinutesInput || parseInt(logMinutesInput, 10) <= 0}
                  onClick={() => handleLogTime(parseInt(logMinutesInput, 10) || 0, logDescInput)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: 6,
                    border: 'none',
                    background: 'var(--affine-primary-color, #3b82f6)',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Save
                </button>
              </div>
            </div>
          )}

          {/* Worklog History Items */}
          {timeLogs.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--affine-text-secondary-color, #a1a1aa)' }}>
                Worklogs ({timeLogs.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 150, overflowY: 'auto' }}>
                {timeLogs.map(log => (
                  <div
                    key={log.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: 6,
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <span style={{ fontWeight: 600, color: 'var(--affine-text-primary-color, #f4f4f5)' }}>
                        {log.description || 'General development work'}
                      </span>
                      <span style={{ fontSize: 11, color: '#71717a' }}>
                        by {log.userName} • {log.loggedAt ? log.loggedAt.split('T')[0] : 'Today'}
                      </span>
                    </div>
                    <span
                      style={{
                        padding: '3px 8px',
                        borderRadius: 4,
                        background: 'rgba(59, 130, 246, 0.15)',
                        color: '#60a5fa',
                        fontWeight: 700,
                        fontFamily: 'monospace',
                        fontSize: 11,
                      }}
                    >
                      {formatDuration(log.timeSpentMinutes)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* GitHub Development Sync (Huly Parity) */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
            marginTop: 4,
            padding: 16,
            borderRadius: 10,
            background: 'var(--affine-background-secondary-color, #27272a)',
            border: '1px solid var(--affine-border-color, #3f3f46)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>🐙</span>
              <span style={{ fontSize: 13, fontWeight: 700 }}>GitHub Development</span>
            </div>
            <button
              type="button"
              onClick={handleAddGitHubLink}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--affine-primary-color, #3b82f6)',
                fontSize: 12,
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              + Link PR / Commit
            </button>
          </div>

          {githubLinks.length === 0 ? (
            <div style={{ fontSize: 12, color: '#71717a' }}>
              No linked pull requests or commits. Commits referencing {issue.id} will automatically appear here.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {githubLinks.map(link => {
                const isPR = link.type === 'pull_request';
                const statusColor =
                  link.status === 'merged' ? '#10b981' : link.status === 'closed' ? '#ef4444' : '#3b82f6';

                return (
                  <div
                    key={link.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      borderRadius: 8,
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.06)',
                      fontSize: 12,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span>{isPR ? '🔀' : '📦'}</span>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          color: 'var(--affine-text-primary-color, #f4f4f5)',
                          textDecoration: 'none',
                          fontWeight: 600,
                        }}
                      >
                        {link.title}
                      </a>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {link.status && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: `${statusColor}22`,
                            color: statusColor,
                            fontWeight: 700,
                            textTransform: 'uppercase',
                          }}
                        >
                          {link.status}
                        </span>
                      )}
                      <span style={{ fontSize: 11, color: '#71717a' }}>by {link.author}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600 }}>
            Comments ({issue.comments?.length || 0})
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {issue.comments?.map(c => (
              <div
                key={c.id}
                style={{
                  background: 'var(--affine-background-secondary-color, #27272a)',
                  padding: 12,
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 12 }}>{c.author}</span>
                  <span style={{ fontSize: 11, color: 'var(--affine-text-secondary-color, #a1a1aa)' }}>
                    {c.createdAt?.split('T')[0]}
                  </span>
                </div>
                <div style={{ color: 'var(--affine-text-primary-color, #f4f4f5)', lineHeight: 1.4 }}>
                  {c.content}
                </div>
              </div>
            ))}
          </div>

          {/* New Comment Box */}
          <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input
              type="text"
              placeholder="Leave a comment..."
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--affine-border-color, #27272a)',
                background: 'var(--affine-background-secondary-color, #27272a)',
                color: 'var(--affine-text-primary-color, #f4f4f5)',
                fontSize: 13,
                outline: 'none',
              }}
            />
            <button
              type="button"
              disabled={isSaving || !commentText.trim()}
              onClick={handleAddComment}
              style={{
                padding: '8px 14px',
                borderRadius: 8,
                background: 'var(--affine-primary-color, #3b82f6)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                border: 'none',
                cursor: commentText.trim() ? 'pointer' : 'default',
                opacity: commentText.trim() ? 1 : 0.6,
              }}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
