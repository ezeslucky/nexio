import { describe, expect, it } from 'vitest';
import {
  calculateEstimateProgress,
  formatDuration,
  formatTimerSeconds,
} from '../time-utils';
import type { TrackerIssue, TrackerTimeLog } from '../types';

describe('Time Tracking & Worklogs (Huly Parity)', () => {
  describe('formatDuration helper', () => {
    it('formats 0 or negative minutes cleanly', () => {
      expect(formatDuration(0)).toBe('0m');
      expect(formatDuration(-15)).toBe('0m');
    });

    it('formats pure minutes under an hour', () => {
      expect(formatDuration(45)).toBe('45m');
      expect(formatDuration(1)).toBe('1m');
    });

    it('formats exact hours', () => {
      expect(formatDuration(60)).toBe('1h');
      expect(formatDuration(120)).toBe('2h');
    });

    it('formats combinations of hours and minutes', () => {
      expect(formatDuration(90)).toBe('1h 30m');
      expect(formatDuration(175)).toBe('2h 55m');
    });
  });

  describe('formatTimerSeconds helper', () => {
    it('formats seconds into HH:MM:SS format', () => {
      expect(formatTimerSeconds(0)).toBe('00:00:00');
      expect(formatTimerSeconds(5)).toBe('00:00:05');
      expect(formatTimerSeconds(65)).toBe('00:01:05');
      expect(formatTimerSeconds(3665)).toBe('01:01:05');
    });
  });

  describe('Time log calculations and aggregation', () => {
    it('aggregates total spent minutes across multiple logs correctly', () => {
      const logs: TrackerTimeLog[] = [
        {
          id: 'log-1',
          issueId: 'NEX-101',
          userId: 'user-1',
          userName: 'Aurobindo Patra',
          timeSpentMinutes: 90,
          description: 'Initial architectural setup',
          loggedAt: '2026-11-26T00:00:00Z',
        },
        {
          id: 'log-2',
          issueId: 'NEX-101',
          userId: 'user-1',
          userName: 'Aurobindo Patra',
          timeSpentMinutes: 120,
          description: 'Prisma schema and Go native handler integration',
          loggedAt: '2026-11-26T01:00:00Z',
        },
      ];

      const totalSpent = logs.reduce((sum, l) => sum + l.timeSpentMinutes, 0);
      expect(totalSpent).toBe(210);
      expect(formatDuration(totalSpent)).toBe('3h 30m');
    });

    it('computes estimate progress percentage accurately', () => {
      const issue: Partial<TrackerIssue> = {
        id: 'NEX-101',
        estimate: 5, // 5 hours = 300 minutes
        totalSpentMinutes: 150, // 2.5 hours = 50%
      };

      const { estMinutes, percentage, isOvertime } = calculateEstimateProgress(
        issue.totalSpentMinutes || 0,
        issue.estimate || 0
      );

      expect(estMinutes).toBe(300);
      expect(percentage).toBe(50);
      expect(isOvertime).toBe(false);
    });

    it('caps progress percentage or flags overtime when spent exceeds estimate', () => {
      const issue: Partial<TrackerIssue> = {
        id: 'NEX-101',
        estimate: 2, // 2 hours = 120 minutes
        totalSpentMinutes: 180, // 3 hours = 150%
      };

      const { estMinutes, percentage, isOvertime } = calculateEstimateProgress(
        issue.totalSpentMinutes || 0,
        issue.estimate || 0
      );

      expect(estMinutes).toBe(120);
      expect(percentage).toBe(100);
      expect(isOvertime).toBe(true);
    });
  });
});
