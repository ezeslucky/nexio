import { describe, expect, it } from 'vitest';
import type {
  WorkspaceActivityItem,
  WorkspaceModuleType,
  WorkspaceNotification,
  WorkspaceSearchResult,
} from '../types';

describe('Cross-Feature Extras: Global Search, Activity Feed, Notifications', () => {
  describe('Global Search Multi-Module Filtering', () => {
    const mockResults: WorkspaceSearchResult[] = [
      {
        id: '1',
        module: 'tracker',
        title: 'NEX-101: Architect multi-workspace database isolation',
        snippet: 'Core database migrations',
        url: '/workspace/ws1/tracker',
        createdAt: '2026-11-26T00:00:00Z',
      },
      {
        id: '2',
        module: 'docs',
        title: 'Release v1.5 Sprint Architecture',
        snippet: 'Technical document specification',
        url: '/workspace/ws1/all',
        createdAt: '2026-11-26T00:00:00Z',
      },
      {
        id: '3',
        module: 'chat',
        title: '#general',
        snippet: 'General team discussion channel',
        url: '/workspace/ws1/channels',
        createdAt: '2026-11-26T00:00:00Z',
      },
      {
        id: '4',
        module: 'office',
        title: 'Main Lounge',
        snippet: 'Casual watercooler room',
        url: '/workspace/ws1/office',
        createdAt: '2026-11-26T00:00:00Z',
      },
    ];

    const filterSearch = (
      results: WorkspaceSearchResult[],
      query: string,
      moduleFilter: WorkspaceModuleType
    ) => {
      const q = query.toLowerCase();
      return results.filter(r => {
        const matchesModule =
          moduleFilter === 'all' || r.module === moduleFilter;
        const matchesQuery =
          !q ||
          r.title.toLowerCase().includes(q) ||
          r.snippet.toLowerCase().includes(q);
        return matchesModule && matchesQuery;
      });
    };

    it('returns all matching records across all modules when filter is "all"', () => {
      const res = filterSearch(mockResults, 'architect', 'all');
      expect(res.length).toBe(2);
      expect(res.map(r => r.module)).toEqual(['tracker', 'docs']);
    });

    it('filters results strictly by module category', () => {
      const resTracker = filterSearch(mockResults, '', 'tracker');
      expect(resTracker.length).toBe(1);
      expect(resTracker[0].module).toBe('tracker');

      const resOffice = filterSearch(mockResults, 'lounge', 'office');
      expect(resOffice.length).toBe(1);
      expect(resOffice[0].title).toBe('Main Lounge');
    });
  });

  describe('Activity Feed Stream Logic', () => {
    it('prepends new activity events maintaining reverse chronological order', () => {
      let activities: WorkspaceActivityItem[] = [
        {
          id: 'act-1',
          workspaceId: 'ws1',
          actorId: 'u1',
          actorName: 'Aurobindo',
          actorAvatar: '',
          module: 'tracker',
          action: 'created_issue',
          targetTitle: 'NEX-101',
          targetUrl: '/tracker',
          createdAt: '2026-11-26T00:00:00Z',
        },
      ];

      const addActivity = (item: WorkspaceActivityItem) => {
        activities = [item, ...activities];
      };

      addActivity({
        id: 'act-2',
        workspaceId: 'ws1',
        actorId: 'u2',
        actorName: 'Alex',
        actorAvatar: '',
        module: 'chat',
        action: 'posted_message',
        targetTitle: 'New update in #general',
        targetUrl: '/channels',
        createdAt: '2026-11-26T00:05:00Z',
      });

      expect(activities.length).toBe(2);
      expect(activities[0].id).toBe('act-2');
      expect(activities[1].id).toBe('act-1');
    });

    it('filters activities by module', () => {
      const activities: WorkspaceActivityItem[] = [
        {
          id: '1',
          workspaceId: 'ws1',
          actorId: 'u1',
          actorName: 'Aurobindo',
          actorAvatar: '',
          module: 'tracker',
          action: 'created_issue',
          targetTitle: 'Task 1',
          targetUrl: '',
          createdAt: '',
        },
        {
          id: '2',
          workspaceId: 'ws1',
          actorId: 'u2',
          actorName: 'Sarah',
          actorAvatar: '',
          module: 'docs',
          action: 'edited_doc',
          targetTitle: 'Architecture v2',
          targetUrl: '',
          createdAt: '',
        },
        {
          id: '3',
          workspaceId: 'ws1',
          actorId: 'u3',
          actorName: 'Alex',
          actorAvatar: '',
          module: 'office',
          action: 'joined_room',
          targetTitle: 'Main Lounge',
          targetUrl: '',
          createdAt: '',
        },
      ];

      const filterByModule = (mod: WorkspaceModuleType) =>
        mod === 'all'
          ? activities
          : activities.filter(a => a.module === mod);

      expect(filterByModule('docs').length).toBe(1);
      expect(filterByModule('docs')[0].actorName).toBe('Sarah');
      expect(filterByModule('all').length).toBe(3);
    });
  });

  describe('Notification Read / Unread State Management', () => {
    let notifications: WorkspaceNotification[] = [
      {
        id: 'notif-1',
        workspaceId: 'ws1',
        userId: 'u-aur',
        actorName: 'Sarah',
        actorAvatar: '',
        module: 'docs',
        title: 'Comment Reply',
        body: 'Sarah replied to your note',
        targetUrl: '/all',
        isRead: false,
        createdAt: '2026-11-26T00:00:00Z',
      },
      {
        id: 'notif-2',
        workspaceId: 'ws1',
        userId: 'u-aur',
        actorName: 'Alex',
        actorAvatar: '',
        module: 'chat',
        title: 'Mention',
        body: '@Aurobindo please check #general',
        targetUrl: '/channels',
        isRead: false,
        createdAt: '2026-11-26T00:01:00Z',
      },
      {
        id: 'notif-3',
        workspaceId: 'ws1',
        userId: 'u-aur',
        actorName: 'Bot',
        actorAvatar: '',
        module: 'tracker',
        title: 'Task Done',
        body: 'NEX-102 completed',
        targetUrl: '/tracker',
        isRead: true,
        createdAt: '2026-11-26T00:02:00Z',
      },
    ];

    it('computes accurate unread count', () => {
      const unreadCount = notifications.filter(n => !n.isRead).length;
      expect(unreadCount).toBe(2);
    });

    it('marks a single notification as read', () => {
      const markRead = (id: string) => {
        notifications = notifications.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        );
      };

      markRead('notif-1');
      const unreadCount = notifications.filter(n => !n.isRead).length;
      expect(unreadCount).toBe(1);
      expect(notifications.find(n => n.id === 'notif-1')?.isRead).toBe(true);
    });

    it('marks all notifications as read', () => {
      notifications = notifications.map(n => ({ ...n, isRead: true }));
      const unreadCount = notifications.filter(n => !n.isRead).length;
      expect(unreadCount).toBe(0);
      expect(notifications.every(n => n.isRead)).toBe(true);
    });
  });
});
