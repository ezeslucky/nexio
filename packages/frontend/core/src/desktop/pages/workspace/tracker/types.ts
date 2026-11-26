export type IssueStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'in_review'
  | 'done'
  | 'canceled';

export type IssuePriority = 'urgent' | 'high' | 'medium' | 'low' | 'none';

export interface TrackerComment {
  id: string;
  issueId: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface TrackerTimeLog {
  id: string;
  issueId: string;
  userId: string;
  userName: string;
  timeSpentMinutes: number;
  description: string;
  loggedAt: string;
}

export interface TrackerGitHubLink {
  id: string;
  issueId: string;
  type: 'commit' | 'pull_request' | 'branch';
  title: string;
  url: string;
  number?: number;
  status?: 'open' | 'merged' | 'closed';
  author: string;
  timestamp: string;
}

export interface TrackerIssue {
  id: string;
  workspaceId: string;
  projectId: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignee: string;
  reporter: string;
  sprintId: string;
  estimate: number;
  labels: string[];
  dueDate: string;
  comments: TrackerComment[];
  timeLogs?: TrackerTimeLog[];
  totalSpentMinutes?: number;
  linkedDocIds?: string[];
  githubLinks?: TrackerGitHubLink[];
  createdAt: string;
  updatedAt: string;
}

export interface TrackerProject {
  id: string;
  workspaceId: string;
  name: string;
  key: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrackerSprint {
  id: string;
  workspaceId: string;
  projectId: string;
  name: string;
  status: 'planned' | 'active' | 'completed';
  startDate: string;
  endDate: string;
  goal: string;
}

export interface TrackerLabel {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
}

export interface ColumnConfig {
  id: IssueStatus;
  label: string;
  color: string;
  badgeBg: string;
}

export const TRACKER_COLUMNS: ColumnConfig[] = [
  { id: 'backlog', label: 'Backlog', color: '#94a3b8', badgeBg: 'rgba(148, 163, 184, 0.15)' },
  { id: 'todo', label: 'To Do', color: '#3b82f6', badgeBg: 'rgba(59, 130, 246, 0.15)' },
  { id: 'in_progress', label: 'In Progress', color: '#f59e0b', badgeBg: 'rgba(245, 158, 11, 0.15)' },
  { id: 'in_review', label: 'In Review', color: '#a855f7', badgeBg: 'rgba(168, 85, 247, 0.15)' },
  { id: 'done', label: 'Done', color: '#10b981', badgeBg: 'rgba(16, 185, 129, 0.15)' },
  { id: 'canceled', label: 'Canceled', color: '#ef4444', badgeBg: 'rgba(239, 68, 68, 0.15)' },
];
