import { describe, expect, it } from 'vitest';
import { CalendarApiService } from '../calendar-service';
import type { CalendarEvent, CalendarFilterOptions } from '../types';

export function filterCalendarEvents(
  events: CalendarEvent[],
  filters: CalendarFilterOptions
): CalendarEvent[] {
  return events.filter(ev => {
    if (!filters.showIssues && ev.issueKey) return false;
    if (!filters.showMeetings && ev.roomId) return false;
    if (!filters.showEvents && !ev.issueKey && !ev.roomId) return false;
    return true;
  });
}

describe('Calendar & Scheduling Module (Huly Parity)', () => {
  describe('convertIssuesToEvents', () => {
    it('converts tracker issues with dueDate into calendar events', () => {
      const issues = [
        {
          id: 'NEX-101',
          title: 'Implement Huly Virtual Office WebRTC',
          dueDate: '2026-11-28',
          priority: 'urgent',
          status: 'in_progress',
        },
        {
          id: 'NEX-102',
          title: 'Design Team Calendar Schedule Grid',
          dueDate: '2026-11-30',
          priority: 'medium',
          status: 'todo',
        },
        {
          id: 'NEX-103',
          title: 'Issue without deadline',
          priority: 'low',
          status: 'backlog',
        },
      ];

      const events = CalendarApiService.convertIssuesToEvents(issues);

      expect(events).toHaveLength(2);
      expect(events[0].id).toBe('issue-event-NEX-101');
      expect(events[0].title).toBe('[NEX-101] Implement Huly Virtual Office WebRTC');
      expect(events[0].color).toBe('#ef4444'); // Urgent gets red
      expect(events[0].allDay).toBe(true);
      expect(events[0].issueKey).toBe('NEX-101');

      expect(events[1].id).toBe('issue-event-NEX-102');
      expect(events[1].color).toBe('#f59e0b'); // Medium gets amber
      expect(events[1].issueKey).toBe('NEX-102');
    });

    it('ignores issues with undefined or empty dueDate', () => {
      const issues = [
        { id: 'NEX-104', title: 'No due date issue' },
        { id: 'NEX-105', title: 'Empty due date issue', dueDate: '' },
      ];

      const events = CalendarApiService.convertIssuesToEvents(issues);
      expect(events).toHaveLength(0);
    });
  });

  describe('filterCalendarEvents', () => {
    const mockEvents: CalendarEvent[] = [
      {
        id: 'cal-1',
        workspaceId: 'ws-1',
        title: 'General Team Sync',
        startTime: '2026-11-26T10:00:00Z',
        endTime: '2026-11-26T11:00:00Z',
        allDay: false,
        color: '#3b82f6',
        createdBy: 'user-1',
      },
      {
        id: 'cal-2',
        workspaceId: 'ws-1',
        title: 'Virtual Office War Room',
        startTime: '2026-11-26T14:00:00Z',
        endTime: '2026-11-26T15:00:00Z',
        allDay: false,
        color: '#8b5cf6',
        roomId: 'room-war-room',
        roomName: 'Dev War Room',
        createdBy: 'user-1',
      },
      {
        id: 'issue-event-NEX-101',
        workspaceId: 'ws-1',
        title: '[NEX-101] Deadline',
        startTime: '2026-11-28T09:00:00Z',
        endTime: '2026-11-28T10:00:00Z',
        allDay: true,
        color: '#ef4444',
        issueId: 'NEX-101',
        issueKey: 'NEX-101',
        createdBy: 'Tracker Sync',
      },
    ];

    it('returns all events when all filter toggles are enabled', () => {
      const filtered = filterCalendarEvents(mockEvents, {
        showIssues: true,
        showMeetings: true,
        showEvents: true,
      });
      expect(filtered).toHaveLength(3);
    });

    it('excludes tracker issues when showIssues is false', () => {
      const filtered = filterCalendarEvents(mockEvents, {
        showIssues: false,
        showMeetings: true,
        showEvents: true,
      });
      expect(filtered).toHaveLength(2);
      expect(filtered.some(e => e.issueKey)).toBe(false);
    });

    it('excludes room meetings when showMeetings is false', () => {
      const filtered = filterCalendarEvents(mockEvents, {
        showIssues: true,
        showMeetings: false,
        showEvents: true,
      });
      expect(filtered).toHaveLength(2);
      expect(filtered.some(e => e.roomId)).toBe(false);
    });

    it('excludes general events when showEvents is false', () => {
      const filtered = filterCalendarEvents(mockEvents, {
        showIssues: true,
        showMeetings: true,
        showEvents: false,
      });
      expect(filtered).toHaveLength(2);
      expect(filtered.some(e => !e.issueKey && !e.roomId)).toBe(false);
    });
  });
});
