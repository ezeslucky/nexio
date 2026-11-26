import { describe, expect, it } from 'vitest';
import type { DocComment, DocLinkedIssue, DocVersionSnapshot } from '../types';

describe('Document Collaboration & Issue Linking Logic', () => {
  it('links an issue to document avoiding duplicate associations', () => {
    let linkedIssues: DocLinkedIssue[] = [
      {
        issueId: 'NEX-101',
        title: 'Architect multi-workspace database isolation',
        status: 'done',
        priority: 'urgent',
        assignee: 'Aurobindo Patra',
      },
    ];

    const linkIssue = (issue: DocLinkedIssue) => {
      const exists = linkedIssues.some(i => i.issueId === issue.issueId);
      if (!exists) {
        linkedIssues = [...linkedIssues, issue];
      }
    };

    // Try adding duplicate
    linkIssue({
      issueId: 'NEX-101',
      title: 'Architect multi-workspace database isolation',
      status: 'done',
      priority: 'urgent',
      assignee: 'Aurobindo Patra',
    });
    expect(linkedIssues.length).toBe(1);

    // Add new issue
    linkIssue({
      issueId: 'NEX-102',
      title: 'Workspace modular navigation and quick switch dock',
      status: 'in_progress',
      priority: 'high',
      assignee: 'Aurobindo Patra',
    });
    expect(linkedIssues.length).toBe(2);
    expect(linkedIssues.map(i => i.issueId)).toEqual(['NEX-101', 'NEX-102']);
  });

  it('unlinks an issue from document correctly', () => {
    let linkedIssues: DocLinkedIssue[] = [
      {
        issueId: 'NEX-101',
        title: 'Issue 1',
        status: 'done',
        priority: 'urgent',
        assignee: 'Aurobindo',
      },
      {
        issueId: 'NEX-102',
        title: 'Issue 2',
        status: 'in_progress',
        priority: 'high',
        assignee: 'Aurobindo',
      },
    ];

    linkedIssues = linkedIssues.filter(i => i.issueId !== 'NEX-101');
    expect(linkedIssues.length).toBe(1);
    expect(linkedIssues[0].issueId).toBe('NEX-102');
  });

  it('creates version snapshot with incremental version numbers', () => {
    const versions: DocVersionSnapshot[] = [
      {
        id: 'ver-1',
        docId: 'doc-1',
        versionNumber: 1,
        title: 'Initial Draft',
        summary: 'Created initial draft',
        author: 'Aurobindo Patra',
        createdAt: '2026-11-25T10:00:00Z',
        size: 1024,
      },
    ];

    const createSnapshot = (title: string, summary: string, author: string): DocVersionSnapshot => {
      const nextVer = versions.length + 1;
      return {
        id: `ver-${nextVer}`,
        docId: 'doc-1',
        versionNumber: nextVer,
        title,
        summary,
        author,
        createdAt: new Date().toISOString(),
        size: 2048,
      };
    };

    const newSnapshot = createSnapshot('Sprint 1 Specs', 'Linked with Tracker NEX-101', 'Aurobindo Patra');
    versions.unshift(newSnapshot);

    expect(versions[0].versionNumber).toBe(2);
    expect(versions[0].title).toBe('Sprint 1 Specs');
    expect(versions.length).toBe(2);
  });

  it('restores a specific document version snapshot', () => {
    const versions: DocVersionSnapshot[] = [
      {
        id: 'ver-2',
        docId: 'doc-1',
        versionNumber: 2,
        title: 'Second Revision',
        summary: 'Updated diagrams',
        author: 'Aurobindo Patra',
        createdAt: '2026-11-25T11:00:00Z',
        size: 2048,
      },
      {
        id: 'ver-1',
        docId: 'doc-1',
        versionNumber: 1,
        title: 'Initial Draft',
        summary: 'Created draft',
        author: 'Aurobindo Patra',
        createdAt: '2026-11-25T10:00:00Z',
        size: 1024,
      },
    ];

    const restoreVersion = (versionId: string) => {
      const found = versions.find(v => v.id === versionId);
      if (!found) throw new Error('Version not found');
      return {
        restored: true,
        versionNumber: found.versionNumber,
        title: found.title,
      };
    };

    const result = restoreVersion('ver-1');
    expect(result.restored).toBe(true);
    expect(result.versionNumber).toBe(1);
    expect(result.title).toBe('Initial Draft');
  });

  it('supports document comment threads and resolution status', () => {
    const comment: DocComment = {
      id: 'comm-1',
      docId: 'doc-1',
      blockId: 'block-123',
      author: 'Sarah Chen',
      content: 'Should we add Yjs websocket heartbeat checking?',
      resolved: false,
      createdAt: '2026-11-25T12:00:00Z',
      replies: [],
    };

    // Add reply
    const updatedComment: DocComment = {
      ...comment,
      replies: [
        ...comment.replies,
        {
          id: 'rep-1',
          author: 'Aurobindo Patra',
          content: 'Already added in the Go native Hub server!',
          createdAt: '2026-11-25T12:05:00Z',
        },
      ],
    };

    expect(updatedComment.replies.length).toBe(1);
    expect(updatedComment.replies[0].author).toBe('Aurobindo Patra');

    // Toggle resolved
    const resolvedComment = {
      ...updatedComment,
      resolved: !updatedComment.resolved,
    };

    expect(resolvedComment.resolved).toBe(true);
  });
});
