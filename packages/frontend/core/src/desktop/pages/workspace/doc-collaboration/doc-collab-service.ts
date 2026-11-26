import type {
  DocComment,
  DocLinkedIssue,
  DocVersionSnapshot,
} from './types';

const BASE_URL = '';

export const DocCollabService = {
  async getLinkedIssues(workspaceId: string, docId: string): Promise<DocLinkedIssue[]> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/docs/${docId}/linked-issues`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        return data.linkedIssues || [];
      }
    } catch (e) {
      console.warn('Failed to fetch linked issues:', e);
    }
    return [];
  },

  async linkIssue(
    workspaceId: string,
    docId: string,
    issueId: string
  ): Promise<boolean> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/docs/${docId}/linked-issues`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ issueId }),
        }
      );
      return res.ok;
    } catch (e) {
      console.error('Failed to link issue to doc:', e);
      return false;
    }
  },

  async unlinkIssue(
    workspaceId: string,
    docId: string,
    issueId: string
  ): Promise<boolean> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/docs/${docId}/linked-issues/${issueId}`,
        {
          method: 'DELETE',
          credentials: 'include',
        }
      );
      return res.ok;
    } catch (e) {
      console.error('Failed to unlink issue:', e);
      return false;
    }
  },

  async getVersions(workspaceId: string, docId: string): Promise<DocVersionSnapshot[]> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/docs/${docId}/versions`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        return data.versions || [];
      }
    } catch (e) {
      console.warn('Failed to fetch doc versions:', e);
    }
    return [];
  },

  async createVersion(
    workspaceId: string,
    docId: string,
    title: string,
    summary: string
  ): Promise<DocVersionSnapshot | null> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/docs/${docId}/versions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ title, summary }),
        }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to create version snapshot:', e);
    }
    return null;
  },

  async restoreVersion(
    workspaceId: string,
    docId: string,
    versionId: string
  ): Promise<boolean> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/docs/${docId}/versions/${versionId}/restore`,
        {
          method: 'POST',
          credentials: 'include',
        }
      );
      return res.ok;
    } catch (e) {
      console.error('Failed to restore version snapshot:', e);
      return false;
    }
  },

  async getComments(workspaceId: string, docId: string): Promise<DocComment[]> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/docs/${docId}/comments`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        return data.comments || [];
      }
    } catch (e) {
      console.warn('Failed to fetch doc comments:', e);
    }
    return [];
  },

  async createComment(
    workspaceId: string,
    docId: string,
    content: string,
    blockId?: string
  ): Promise<DocComment | null> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/docs/${docId}/comments`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content, blockId: blockId || '' }),
        }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to create comment:', e);
    }
    return null;
  },

  async replyComment(
    workspaceId: string,
    docId: string,
    commentId: string,
    content: string
  ): Promise<DocComment | null> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/docs/${docId}/comments/${commentId}/replies`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ content }),
        }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to reply to comment:', e);
    }
    return null;
  },

  async resolveComment(
    workspaceId: string,
    docId: string,
    commentId: string
  ): Promise<DocComment | null> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/docs/${docId}/comments/${commentId}/resolve`,
        {
          method: 'PATCH',
          credentials: 'include',
        }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to resolve comment:', e);
    }
    return null;
  },
};
