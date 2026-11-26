import {
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
} from '@nexio/core/modules/workbench';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { useService } from '@toeverything/infra';
import { useCallback, useEffect, useState } from 'react';

import { ChannelSidebar } from './channel-sidebar';
import { ChatService } from './chat-service';
import { MessageComposer } from './message-composer';
import { MessageList } from './message-list';
import { ThreadDrawer } from './thread-drawer';
import type { ChatAttachment, ChatChannel, ChatMessage, DirectMessageConv } from './types';

export const Component = () => {
  const workspaceService = useService(WorkspaceService);
  const currentWorkspace = workspaceService.workspace;
  const wsId = currentWorkspace.id;

  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [dms, setDMs] = useState<DirectMessageConv[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string>('chan-general');
  const [activeDMId, setActiveDMId] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typers, setTypers] = useState<string[]>([]);
  const [activeThreadMessage, setActiveThreadMessage] = useState<ChatMessage | null>(null);
  const [loading, setLoading] = useState(true);

  const currentUserName = 'Aurobindo Patra';

  // Load initial channels & DMs
  const refreshChannelsAndDMs = useCallback(async () => {
    const [fetchedChannels, fetchedDMs] = await Promise.all([
      ChatService.getChannels(wsId),
      ChatService.getDMs(wsId),
    ]);
    if (fetchedChannels.length > 0) {
      setChannels(fetchedChannels);
      if (!activeChannelId && !activeDMId) {
        setActiveChannelId(fetchedChannels[0].id);
      }
    }
    if (fetchedDMs.length > 0) {
      setDMs(fetchedDMs);
    }
    setLoading(false);
  }, [wsId, activeChannelId, activeDMId]);

  // Load messages for current active channel
  const refreshMessages = useCallback(async () => {
    if (activeChannelId && !activeDMId) {
      const msgs = await ChatService.getMessages(wsId, activeChannelId);
      setMessages(msgs);
    }
  }, [wsId, activeChannelId, activeDMId]);

  // Load typing status
  const refreshTyping = useCallback(async () => {
    const target = activeDMId || activeChannelId;
    if (target) {
      const activeTypers = await ChatService.getTyping(wsId, target);
      setTypers(activeTypers.filter(name => name !== currentUserName));
    }
  }, [wsId, activeChannelId, activeDMId, currentUserName]);

  useEffect(() => {
    refreshChannelsAndDMs();
  }, [refreshChannelsAndDMs]);

  useEffect(() => {
    refreshMessages();
  }, [refreshMessages]);

  // Periodic polling for new messages & typing indicators
  useEffect(() => {
    const interval = setInterval(() => {
      refreshMessages();
      refreshTyping();
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshMessages, refreshTyping]);

  const handleSelectChannel = (channelId: string) => {
    setActiveChannelId(channelId);
    setActiveDMId('');
    setActiveThreadMessage(null);
  };

  const handleSelectDM = (dmId: string) => {
    setActiveDMId(dmId);
    setActiveChannelId('');
    setActiveThreadMessage(null);
  };

  const handleCreateChannel = async (data: {
    name: string;
    description: string;
    topic: string;
    isPrivate: boolean;
  }) => {
    const created = await ChatService.createChannel(wsId, data);
    if (created) {
      setChannels(prev => [...prev, created]);
      setActiveChannelId(created.id);
      setActiveDMId('');
    }
  };

  const handleSendMessage = async (content: string, attachments: ChatAttachment[]) => {
    if (!activeChannelId && !activeDMId) return;
    const targetId = activeChannelId || activeDMId;
    const sent = await ChatService.sendMessage(wsId, targetId, content, undefined, attachments);
    if (sent) {
      setMessages(prev => [...prev, sent]);
    }
  };

  const handleToggleReaction = async (messageId: string, emoji: string) => {
    const updated = await ChatService.toggleReaction(wsId, messageId, emoji);
    if (updated) {
      setMessages(prev => prev.map(m => (m.id === messageId ? updated : m)));
    }
  };

  const handleTyping = (isTyping: boolean) => {
    const targetId = activeDMId || activeChannelId;
    if (targetId) {
      ChatService.sendTyping(wsId, targetId, isTyping);
    }
  };

  const activeChannel = channels.find(c => c.id === activeChannelId);
  const activeDM = dms.find(d => d.id === activeDMId);
  const titleName = activeChannel
    ? `#${activeChannel.name}`
    : activeDM
      ? activeDM.members.find(m => m !== currentUserName) || 'Direct Message'
      : 'Channels';
  const topicText = activeChannel?.topic || activeChannel?.description || 'Team conversations & real-time updates';

  return (
    <>
      <ViewHeader>
        <ViewIcon icon="ai" />
        <ViewTitle title={titleName} />
      </ViewHeader>

      <ViewBody>
        <div
          style={{
            display: 'flex',
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            backgroundColor: 'var(--affine-background-primary-color, #121214)',
          }}
        >
          {/* Channel Sidebar Switcher */}
          <ChannelSidebar
            channels={channels}
            dms={dms}
            activeChannelId={activeChannelId}
            activeDMId={activeDMId}
            onSelectChannel={handleSelectChannel}
            onSelectDM={handleSelectDM}
            onCreateChannel={handleCreateChannel}
          />

          {/* Main Chat Area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              minWidth: 0,
              height: '100%',
              backgroundColor: 'var(--affine-background-primary-color, #121214)',
            }}
          >
            {/* Channel Top Header Bar */}
            <div
              style={{
                height: 52,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 24px',
                borderBottom: '1px solid var(--affine-border-color, rgba(255,255,255,0.08))',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: '#ffffff' }}>
                  {titleName}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    color: '#71717a',
                    borderLeft: '1px solid rgba(255,255,255,0.1)',
                    paddingLeft: 10,
                    textOverflow: 'ellipsis',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {topicText}
                </span>
              </div>

              {/* Members Count & Quick Controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {activeChannel && (
                  <span
                    style={{
                      fontSize: 12,
                      color: '#a1a1aa',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      padding: '3px 8px',
                      borderRadius: 12,
                    }}
                  >
                    👥 {activeChannel.members?.length || 3} members
                  </span>
                )}
                <span
                  style={{
                    fontSize: 11,
                    color: '#22c55e',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#22c55e' }} />
                  Live
                </span>
              </div>
            </div>

            {/* Message Feed */}
            <MessageList
              messages={messages}
              currentUserName={currentUserName}
              onToggleReaction={handleToggleReaction}
              onOpenThread={msg => setActiveThreadMessage(msg)}
            />

            {/* Typing Banner */}
            {typers.length > 0 && (
              <div
                style={{
                  padding: '2px 24px',
                  fontSize: 11,
                  color: '#60a5fa',
                  fontStyle: 'italic',
                }}
              >
                {typers.join(', ')} {typers.length === 1 ? 'is' : 'are'} typing...
              </div>
            )}

            {/* Composer */}
            <MessageComposer
              channelName={activeChannel?.name || 'chat'}
              onSendMessage={handleSendMessage}
              onTyping={handleTyping}
            />
          </div>

          {/* Right Thread Slide-over Drawer */}
          {activeThreadMessage && (
            <ThreadDrawer
              workspaceId={wsId}
              parentMessage={activeThreadMessage}
              onClose={() => setActiveThreadMessage(null)}
              onReplyAdded={reply => {
                // Update parent thread count locally
                setMessages(prev =>
                  prev.map(m =>
                    m.id === activeThreadMessage.id
                      ? { ...m, threadCount: (m.threadCount || 0) + 1 }
                      : m
                  )
                );
              }}
            />
          )}
        </div>
      </ViewBody>
    </>
  );
};
