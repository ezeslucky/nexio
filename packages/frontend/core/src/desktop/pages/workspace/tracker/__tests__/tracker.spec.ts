import { describe, expect, it } from 'vitest';

import type {
  IssuePriority,
  IssueStatus,
  TrackerComment,
  TrackerIssue,
  TrackerSprint,
} from '../types';

export function filterTrackerIssues(
  issues: TrackerIssue[],
  filters: {
    status?: IssueStatus | 'all';
    priority?: IssuePriority | 'all';
    sprintId?: string | 'all';
    search?: string;
  }
): TrackerIssue[] {
  return issues.filter(issue => {
    if (filters.status && filters.status !== 'all' && issue.status !== filters.status) {
      return false;
    }
    if (filters.priority && filters.priority !== 'all' && issue.priority !== filters.priority) {
      return false;
    }
    if (filters.sprintId && filters.sprintId !== 'all' && issue.sprintId !== filters.sprintId) {
      return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        issue.title.toLowerCase().includes(q) ||
        issue.id.toLowerCase().includes(q) ||
        issue.description?.toLowerCase().includes(q) ||
        issue.labels?.some(l => l.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });
}

export function calculateSprintMetrics(
  sprint: TrackerSprint,
  issues: TrackerIssue[]
): {
  totalIssues: number;
  completedIssues: number;
  totalPoints: number;
  completedPoints: number;
  completionPercent: number;
} {
  const sprintIssues = issues.filter(i => i.sprintId === sprint.id);
  const completed = sprintIssues.filter(i => i.status === 'done');
  const totalPoints = sprintIssues.reduce((acc, curr) => acc + (curr.estimate || 0), 0);
  const completedPoints = completed.reduce((acc, curr) => acc + (curr.estimate || 0), 0);
  const completionPercent =
    sprintIssues.length > 0 ? Math.round((completed.length / sprintIssues.length) * 100) : 0;

  return {
    totalIssues: sprintIssues.length,
    completedIssues: completed.length,
    totalPoints,
    completedPoints,
    completionPercent,
  };
}

export function appendIssueComment(
  issue: TrackerIssue,
  content: string,
  author: string
): TrackerIssue {
  const newComment: TrackerComment = {
    id: `c-${Date.now()}`,
    issueId: issue.id,
    author,
    content,
    createdAt: new Date().toISOString(),
  };
  return {
    ...issue,
    comments: [...(issue.comments || []), newComment],
    updatedAt: new Date().toISOString(),
  };
}

describe('Project Tracker Logic (Phase 2)', () => {
  const mockIssues: TrackerIssue[] = [
    {
      id: 'NEX-101',
      workspaceId: 'ws-1',
      projectId: 'proj-core',
      title: 'Architect multi-workspace database isolation',
      description: 'Ensure workspace data is isolated',
      status: 'done',
      priority: 'urgent',
      assignee: 'Aurobindo Patra',
      reporter: 'Aurobindo Patra',
      sprintId: 'sprint-1',
      estimate: 5,
      labels: ['backend', 'architecture'],
      dueDate: '2026-11-28',
      comments: [],
      createdAt: '2026-11-20T00:00:00Z',
      updatedAt: '2026-11-20T00:00:00Z',
    },
    {
      id: 'NEX-102',
      workspaceId: 'ws-1',
      projectId: 'proj-core',
      title: 'Workspace modular navigation and quick switch dock',
      description: 'Persistent switcher dock for all modules',
      status: 'in_progress',
      priority: 'high',
      assignee: 'Aurobindo Patra',
      reporter: 'Aurobindo Patra',
      sprintId: 'sprint-1',
      estimate: 3,
      labels: ['frontend'],
      dueDate: '2026-11-30',
      comments: [],
      createdAt: '2026-11-25T00:00:00Z',
      updatedAt: '2026-11-25T00:00:00Z',
    },
    {
      id: 'NEX-103',
      workspaceId: 'ws-1',
      projectId: 'proj-core',
      title: 'Real-time collaborative channels over WebSockets',
      description: 'Team chat channels and threads',
      status: 'todo',
      priority: 'high',
      assignee: 'Unassigned',
      reporter: 'Aurobindo Patra',
      sprintId: 'sprint-1',
      estimate: 8,
      labels: ['backend', 'chat'],
      dueDate: '2026-12-02',
      comments: [],
      createdAt: '2026-11-25T00:00:00Z',
      updatedAt: '2026-11-25T00:00:00Z',
    },
  ];

  it('filters issues by priority and status accurately', () => {
    const urgentIssues = filterTrackerIssues(mockIssues, { priority: 'urgent' });
    expect(urgentIssues).toHaveLength(1);
    expect(urgentIssues[0].id).toBe('NEX-101');

    const inProgressIssues = filterTrackerIssues(mockIssues, { status: 'in_progress' });
    expect(inProgressIssues).toHaveLength(1);
    expect(inProgressIssues[0].id).toBe('NEX-102');
  });

  it('filters issues by search keyword matching title, id or labels', () => {
    const searchById = filterTrackerIssues(mockIssues, { search: 'NEX-103' });
    expect(searchById).toHaveLength(1);

    const searchByLabel = filterTrackerIssues(mockIssues, { search: 'architecture' });
    expect(searchByLabel).toHaveLength(1);
    expect(searchByLabel[0].id).toBe('NEX-101');
  });

  it('calculates sprint metrics and velocity points correctly', () => {
    const sprint: TrackerSprint = {
      id: 'sprint-1',
      workspaceId: 'ws-1',
      projectId: 'proj-core',
      name: 'Sprint 1',
      status: 'active',
      startDate: '2026-11-20',
      endDate: '2026-12-04',
      goal: 'Deliver phase 1 & 2',
    };

    const metrics = calculateSprintMetrics(sprint, mockIssues);
    expect(metrics.totalIssues).toBe(3);
    expect(metrics.completedIssues).toBe(1);
    expect(metrics.totalPoints).toBe(16); // 5 + 3 + 8
    expect(metrics.completedPoints).toBe(5);
    expect(metrics.completionPercent).toBe(33); // 1 / 3 = 33%
  });

  it('correctly appends comments to an issue', () => {
    const issue = mockIssues[0];
    const withComment = appendIssueComment(
      issue,
      'Migration verified on PostgreSQL schema.',
      'Aurobindo Patra'
    );

    expect(withComment.comments).toHaveLength(1);
    expect(withComment.comments[0].content).toBe('Migration verified on PostgreSQL schema.');
    expect(withComment.comments[0].author).toBe('Aurobindo Patra');
  });
});
