import { describe, expect, it } from 'vitest';
import type { IssueStatus, TrackerGitHubLink } from '../types';

export function extractIssueKeys(text: string): string[] {
  if (!text) return [];
  const matches = text.match(/NEX-\d+/g);
  return matches ? Array.from(new Set(matches)) : [];
}

export function computeNextStatusFromPR(
  action: 'opened' | 'closed' | 'reopened',
  isMerged: boolean,
  currentStatus: IssueStatus
): IssueStatus {
  if (isMerged) return 'done';
  if (action === 'opened') {
    if (currentStatus === 'todo' || currentStatus === 'backlog') {
      return 'in_review';
    }
  }
  return currentStatus;
}

export function sortGitHubLinks(links: TrackerGitHubLink[]): TrackerGitHubLink[] {
  return [...links].sort((a, b) => {
    // PRs rank before commits
    if (a.type === 'pull_request' && b.type !== 'pull_request') return -1;
    if (b.type === 'pull_request' && a.type !== 'pull_request') return 1;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });
}

describe('GitHub Two-Way Sync Integration (Huly Parity)', () => {
  describe('extractIssueKeys helper', () => {
    it('extracts single issue key from standard commit message', () => {
      const msg = 'feat(tracker): NEX-101 add WebRTC data channels';
      expect(extractIssueKeys(msg)).toEqual(['NEX-101']);
    });

    it('extracts multiple distinct issue keys from merge commit or PR title', () => {
      const title = 'Merge pull request #42 from feature/NEX-101-and-NEX-102-collab';
      expect(extractIssueKeys(title)).toEqual(['NEX-101', 'NEX-102']);
    });

    it('returns empty array when text contains no issue key', () => {
      const msg = 'chore(deps): bump vite from 5.4 to 6.0';
      expect(extractIssueKeys(msg)).toEqual([]);
    });

    it('deduplicates repetitive keys in commit messages', () => {
      const body = 'Fix NEX-101: NEX-101 was causing signaling drops';
      expect(extractIssueKeys(body)).toEqual(['NEX-101']);
    });
  });

  describe('computeNextStatusFromPR automated status transitions', () => {
    it('advances issue to "in_review" when PR is opened', () => {
      const next = computeNextStatusFromPR('opened', false, 'todo');
      expect(next).toBe('in_review');
    });

    it('advances issue to "done" when PR is merged', () => {
      const next = computeNextStatusFromPR('closed', true, 'in_review');
      expect(next).toBe('done');
    });

    it('retains current status when unmerged PR is closed', () => {
      const next = computeNextStatusFromPR('closed', false, 'in_review');
      expect(next).toBe('in_review');
    });
  });

  describe('sortGitHubLinks prioritization', () => {
    it('sorts Pull Requests ahead of standalone commits', () => {
      const links: TrackerGitHubLink[] = [
        {
          id: 'gh-1',
          issueId: 'NEX-101',
          type: 'commit',
          title: 'Initial commit',
          url: 'https://github.com/tech-nexio/nexio/commit/12345',
          author: 'dev',
          timestamp: '2026-11-26T10:00:00Z',
        },
        {
          id: 'gh-2',
          issueId: 'NEX-101',
          type: 'pull_request',
          title: '[NEX-101] PR',
          url: 'https://github.com/tech-nexio/nexio/pull/1',
          status: 'merged',
          author: 'dev',
          timestamp: '2026-11-26T09:00:00Z',
        },
      ];

      const sorted = sortGitHubLinks(links);
      expect(sorted[0].type).toBe('pull_request');
      expect(sorted[1].type).toBe('commit');
    });
  });
});
