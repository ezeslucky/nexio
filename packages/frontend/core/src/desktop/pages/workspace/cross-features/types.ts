export type WorkspaceModuleType =
  | 'tracker'
  | 'docs'
  | 'chat'
  | 'office'
  | 'all';

export interface WorkspaceSearchResult {
  id: string;
  module: 'tracker' | 'docs' | 'chat' | 'office';
  title: string;
  snippet: string;
  url: string;
  metadata?: string;
  createdAt: string;
}

export interface GlobalSearchResponse {
  query: string;
  results: WorkspaceSearchResult[];
  total: number;
}

export interface WorkspaceActivityItem {
  id: string;
  workspaceId: string;
  actorId: string;
  actorName: string;
  actorAvatar: string;
  module: 'tracker' | 'docs' | 'chat' | 'office';
  action: string;
  targetTitle: string;
  targetUrl: string;
  details?: string;
  createdAt: string;
}

export interface ActivityFeedResponse {
  activities: WorkspaceActivityItem[];
  total: number;
}

export interface WorkspaceNotification {
  id: string;
  workspaceId: string;
  userId: string;
  actorName: string;
  actorAvatar: string;
  module: 'tracker' | 'docs' | 'chat' | 'office';
  title: string;
  body: string;
  targetUrl: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationsResponse {
  notifications: WorkspaceNotification[];
  unreadCount: number;
  total: number;
}
