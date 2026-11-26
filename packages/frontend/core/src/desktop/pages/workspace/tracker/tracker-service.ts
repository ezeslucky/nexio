import type {
  TrackerComment,
  TrackerGitHubLink,
  TrackerIssue,
  TrackerLabel,
  TrackerProject,
  TrackerSprint,
  TrackerTimeLog,
} from './types';

export class TrackerApiService {
  private static baseUrl = '/api/workspaces';

  static async getIssues(
    workspaceId: string,
    filters?: { status?: string; priority?: string; sprintId?: string; search?: string }
  ): Promise<TrackerIssue[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.set('status', filters.status);
    if (filters?.priority) params.set('priority', filters.priority);
    if (filters?.sprintId) params.set('sprintId', filters.sprintId);
    if (filters?.search) params.set('search', filters.search);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${this.baseUrl}/${workspaceId}/issues${query}`);
    if (!res.ok) throw new Error('Failed to fetch issues');
    const data = await res.json();
    return data.issues || [];
  }

  static async createIssue(
    workspaceId: string,
    issue: Partial<TrackerIssue>
  ): Promise<TrackerIssue> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/issues`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(issue),
    });
    if (!res.ok) throw new Error('Failed to create issue');
    return await res.json();
  }

  static async updateIssue(
    workspaceId: string,
    issueId: string,
    updates: Partial<TrackerIssue>
  ): Promise<TrackerIssue> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/issues/${issueId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update issue');
    return await res.json();
  }

  static async deleteIssue(workspaceId: string, issueId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/issues/${issueId}`, {
      method: 'DELETE',
    });
    return res.ok;
  }

  static async addComment(
    workspaceId: string,
    issueId: string,
    content: string,
    author = 'Aurobindo Patra'
  ): Promise<TrackerComment> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/issues/${issueId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, author }),
    });
    if (!res.ok) throw new Error('Failed to add comment');
    return await res.json();
  }

  static async getProjects(workspaceId: string): Promise<TrackerProject[]> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/projects`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.projects || [];
  }

  static async getSprints(workspaceId: string): Promise<TrackerSprint[]> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/sprints`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.sprints || [];
  }

  static async createSprint(
    workspaceId: string,
    sprint: Partial<TrackerSprint>
  ): Promise<TrackerSprint> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/sprints`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sprint),
    });
    if (!res.ok) throw new Error('Failed to create sprint');
    return await res.json();
  }

  static async updateSprint(
    workspaceId: string,
    sprintId: string,
    updates: Partial<TrackerSprint>
  ): Promise<TrackerSprint> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/sprints/${sprintId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update sprint');
    return await res.json();
  }

  static async getLabels(workspaceId: string): Promise<TrackerLabel[]> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/labels`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.labels || [];
  }

  static async getIssueTimeLogs(
    workspaceId: string,
    issueId: string
  ): Promise<TrackerTimeLog[]> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/issues/${issueId}/timelogs`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.timeLogs || [];
  }

  static async logIssueTime(
    workspaceId: string,
    issueId: string,
    payload: { timeSpentMinutes: number; description?: string; userName?: string }
  ): Promise<TrackerTimeLog> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/issues/${issueId}/timelogs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to log time');
    return await res.json();
  }

  static async getWorkspaceTimeLogs(
    workspaceId: string
  ): Promise<TrackerTimeLog[]> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/timelogs`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.timeLogs || [];
  }

  static async getIssueGitHubLinks(
    workspaceId: string,
    issueId: string
  ): Promise<TrackerGitHubLink[]> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/issues/${issueId}/github`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.links || [];
  }

  static async linkGitHubItem(
    workspaceId: string,
    issueId: string,
    item: Partial<TrackerGitHubLink>
  ): Promise<TrackerGitHubLink> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/issues/${issueId}/github`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!res.ok) throw new Error('Failed to link GitHub item');
    return await res.json();
  }
}
