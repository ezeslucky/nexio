import type {
  ChatChannel,
  ChatMessage,
  DirectMessageConv,
  ThreadData,
} from './types';

const BASE_URL = '';

export const ChatService = {
  async getChannels(workspaceId: string): Promise<ChatChannel[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/channels`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        return data.channels || [];
      }
    } catch (e) {
      console.warn('Failed to fetch channels from backend:', e);
    }
    return [];
  },

  async createChannel(
    workspaceId: string,
    channel: Partial<ChatChannel>
  ): Promise<ChatChannel | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(channel),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to create channel:', e);
    }
    return null;
  },

  async getMessages(workspaceId: string, channelId: string): Promise<ChatMessage[]> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/channels/${channelId}/messages`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        return data.messages || [];
      }
    } catch (e) {
      console.warn('Failed to fetch messages:', e);
    }
    return [];
  },

  async sendMessage(
    workspaceId: string,
    channelId: string,
    content: string,
    parentId?: string,
    attachments?: any[]
  ): Promise<ChatMessage | null> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/channels/${channelId}/messages`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            content,
            parentId: parentId || '',
            attachments: attachments || [],
          }),
        }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to post message:', e);
    }
    return null;
  },

  async getThread(workspaceId: string, messageId: string): Promise<ThreadData | null> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/messages/${messageId}/thread`,
        { credentials: 'include' }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.warn('Failed to fetch thread:', e);
    }
    return null;
  },

  async toggleReaction(
    workspaceId: string,
    messageId: string,
    emoji: string
  ): Promise<ChatMessage | null> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/messages/${messageId}/reactions`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ emoji }),
        }
      );
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to toggle reaction:', e);
    }
    return null;
  },

  async getDMs(workspaceId: string): Promise<DirectMessageConv[]> {
    try {
      const res = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/dms`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        return data.dms || [];
      }
    } catch (e) {
      console.warn('Failed to fetch DMs:', e);
    }
    return [];
  },

  async createDM(
    workspaceId: string,
    dm: Partial<DirectMessageConv>
  ): Promise<DirectMessageConv | null> {
    try {
      const res = await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/dms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(dm),
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (e) {
      console.error('Failed to create DM:', e);
    }
    return null;
  },

  async sendTyping(workspaceId: string, targetId: string, isTyping: boolean): Promise<void> {
    try {
      await fetch(`${BASE_URL}/api/workspaces/${workspaceId}/chat/typing`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetId, isTyping }),
      });
    } catch {}
  },

  async getTyping(workspaceId: string, targetId: string): Promise<string[]> {
    try {
      const res = await fetch(
        `${BASE_URL}/api/workspaces/${workspaceId}/chat/typing?target=${encodeURIComponent(targetId)}`,
        { credentials: 'include' }
      );
      if (res.ok) {
        const data = await res.json();
        return data.typers || [];
      }
    } catch {}
    return [];
  },
};
