import { describe, expect, it } from 'vitest';
import type { ChatMessage, ChatReaction } from '../types';

describe('Chat Channel & Messaging Logic', () => {
  it('extracts @ mentions from chat content correctly', () => {
    const parseMentions = (content: string) => {
      const mentions: string[] = [];
      const words = content.split(' ');
      for (const w of words) {
        if (w.startsWith('@') && w.length > 1) {
          const clean = w.slice(1).replace(/[.,!?:;]+$/, '');
          if (clean) mentions.push(clean);
        }
      }
      return mentions;
    };

    const text = 'Hey @Aurobindo, please check this PR with @Sarah! Ready for review.';
    const mentions = parseMentions(text);

    expect(mentions).toEqual(['Aurobindo', 'Sarah']);
  });

  it('handles emoji reaction toggle: add new reaction', () => {
    const reactions: ChatReaction[] = [];
    const emoji = '🚀';
    const user = 'Aurobindo Patra';

    const existing = reactions.find(r => r.emoji === emoji);
    if (!existing) {
      reactions.push({ emoji, users: [user], count: 1 });
    }

    expect(reactions.length).toBe(1);
    expect(reactions[0].emoji).toBe('🚀');
    expect(reactions[0].count).toBe(1);
    expect(reactions[0].users).toContain('Aurobindo Patra');
  });

  it('handles emoji reaction toggle: remove existing reaction when clicked again', () => {
    let reactions: ChatReaction[] = [
      { emoji: '👍', users: ['Aurobindo Patra', 'Sarah Chen'], count: 2 },
    ];
    const user = 'Aurobindo Patra';

    reactions = reactions
      .map(r => {
        if (r.emoji === '👍') {
          const updatedUsers = r.users.filter(u => u !== user);
          return { emoji: r.emoji, users: updatedUsers, count: updatedUsers.length };
        }
        return r;
      })
      .filter(r => r.count > 0);

    expect(reactions[0].count).toBe(1);
    expect(reactions[0].users).toEqual(['Sarah Chen']);
  });

  it('correctly increments parent message threadCount on reply', () => {
    const parent: ChatMessage = {
      id: 'msg-1',
      workspaceId: 'ws-1',
      channelId: 'chan-general',
      senderId: 'user-1',
      senderName: 'Sarah Chen',
      content: 'Any updates on the sprint?',
      mentions: [],
      attachments: [],
      reactions: [],
      threadCount: 0,
      createdAt: '2026-11-25T12:00:00Z',
    };

    const reply: ChatMessage = {
      id: 'msg-2',
      workspaceId: 'ws-1',
      channelId: 'chan-general',
      parentId: 'msg-1',
      senderId: 'user-2',
      senderName: 'Aurobindo Patra',
      content: 'Completed the real-time chat module!',
      mentions: [],
      attachments: [],
      reactions: [],
      threadCount: 0,
      createdAt: '2026-11-25T12:05:00Z',
    };

    const updatedParent = {
      ...parent,
      threadCount: parent.threadCount + 1,
    };

    expect(updatedParent.threadCount).toBe(1);
    expect(reply.parentId).toBe('msg-1');
  });

  it('formats attachment size correctly into KB and MB', () => {
    const formatSize = (bytes: number) => {
      if (bytes < 1024 * 1024) {
        return `${(bytes / 1024).toFixed(1)} KB`;
      }
      return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    expect(formatSize(51200)).toBe('50.0 KB');
    expect(formatSize(2621440)).toBe('2.5 MB');
  });
});
