import type {
  ActivityFeedResponse,
  GlobalSearchResponse,
  NotificationsResponse,
  WorkspaceActivityItem,
  WorkspaceModuleType,
  WorkspaceNotification,
} from './types';

export class CrossFeatureService {
  private static getBaseUrl(workspaceId: string): string {
    return `/api/workspaces/${encodeURIComponent(workspaceId)}`;
  }

  static async search(
    workspaceId: string,
    query: string,
    module?: WorkspaceModuleType
  ): Promise<GlobalSearchResponse> {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (module && module !== 'all') params.set('module', module);

    const res = await fetch(
      `${this.getBaseUrl(workspaceId)}/search?${params.toString()}`
    );
    if (!res.ok) {
      throw new Error(`Global search failed: ${res.statusText}`);
    }
    return res.json();
  }

  static async getActivityFeed(
    workspaceId: string
  ): Promise<ActivityFeedResponse> {
    const res = await fetch(`${this.getBaseUrl(workspaceId)}/activity`);
    if (!res.ok) {
      throw new Error(`Failed to load activity feed: ${res.statusText}`);
    }
    return res.json();
  }

  static async postActivity(
    workspaceId: string,
    activity: Partial<WorkspaceActivityItem>
  ): Promise<WorkspaceActivityItem> {
    const res = await fetch(`${this.getBaseUrl(workspaceId)}/activity`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activity),
    });
    if (!res.ok) {
      throw new Error(`Failed to post activity: ${res.statusText}`);
    }
    return res.json();
  }

  static async getNotifications(
    workspaceId: string
  ): Promise<NotificationsResponse> {
    const res = await fetch(`${this.getBaseUrl(workspaceId)}/notifications`);
    if (!res.ok) {
      throw new Error(`Failed to load notifications: ${res.statusText}`);
    }
    return res.json();
  }

  static async markNotificationRead(
    workspaceId: string,
    notificationId: string
  ): Promise<WorkspaceNotification> {
    const res = await fetch(
      `${this.getBaseUrl(workspaceId)}/notifications/${encodeURIComponent(notificationId)}/read`,
      {
        method: 'PATCH',
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to mark notification read: ${res.statusText}`);
    }
    return res.json();
  }

  static async markAllNotificationsRead(
    workspaceId: string
  ): Promise<{ success: boolean }> {
    const res = await fetch(
      `${this.getBaseUrl(workspaceId)}/notifications/read-all`,
      {
        method: 'POST',
      }
    );
    if (!res.ok) {
      throw new Error(
        `Failed to mark all notifications read: ${res.statusText}`
      );
    }
    return res.json();
  }
}
