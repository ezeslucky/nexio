import { useEffect, useState } from 'react';
import { ChatService } from './chat-service';
import { MessageComposer } from './message-composer';
import type { ChatAttachment, ChatMessage } from './types';

interface ThreadDrawerProps {
  workspaceId: string;
  parentMessage: ChatMessage;
  onClose: () => void;
  onReplyAdded: (reply: ChatMessage) => void;
}

export const ThreadDrawer = ({
  workspaceId,
  parentMessage,
  onClose,
  onReplyAdded,
}: ThreadDrawerProps) => {
  const [replies, setReplies] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    ChatService.getThread(workspaceId, parentMessage.id).then(data => {
      if (mounted) {
        if (data) {
          setReplies(data.replies || []);
        }
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, [workspaceId, parentMessage.id]);

  const handleSendReply = async (content: string, attachments: ChatAttachment[]) => {
    const res = await ChatService.sendMessage(
      workspaceId,
      parentMessage.channelId || '',
      content,
      parentMessage.id,
      attachments
    );
    if (res) {
      setReplies(prev => [...prev, res]);
      onReplyAdded(res);
    }
  };

  return (
    <aside
      style={{
        width: 360,
        height: '100%',
        backgroundColor: 'var(--affine-background-primary-color, #141416)',
        borderLeft: '1px solid var(--affine-border-color, rgba(255,255,255,0.08))',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-8px 0 24px rgba(0,0,0,0.3)',
        zIndex: 50,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--affine-border-color, rgba(255,255,255,0.08))',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: '#ffffff' }}>Thread</span>
          <span style={{ fontSize: 12, color: '#71717a' }}>
            #{parentMessage.channelId || 'conversation'}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#a1a1aa',
            fontSize: 16,
            cursor: 'pointer',
            padding: '2px 6px',
            borderRadius: 4,
          }}
        >
          ✕
        </button>
      </div>

      {/* Parent Root Message Card */}
      <div
        style={{
          padding: '14px 18px',
          borderBottom: '1px solid var(--affine-border-color, rgba(255,255,255,0.08))',
          backgroundColor: 'rgba(255,255,255,0.02)',
        }}
      >
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
          <div
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              backgroundColor: '#3b82f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: 12,
              color: '#ffffff',
            }}
          >
            {parentMessage.senderName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#ffffff' }}>
              {parentMessage.senderName}
            </div>
            <div style={{ fontSize: 11, color: '#71717a' }}>
              {new Date(parentMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </div>
        <div style={{ fontSize: 13, lineHeight: '1.5', color: '#e4e4e7' }}>
          {parentMessage.content}
        </div>
      </div>

      {/* Replies List */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 600, color: '#71717a', textTransform: 'uppercase' }}>
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </div>

        {loading ? (
          <div style={{ color: '#71717a', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
            Loading replies...
          </div>
        ) : replies.length === 0 ? (
          <div style={{ color: '#71717a', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
            No replies yet. Start the thread discussion below!
          </div>
        ) : (
          replies.map(rep => (
            <div key={rep.id} style={{ display: 'flex', gap: 10 }}>
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: '50%',
                  backgroundColor: '#6366f1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 11,
                  color: '#ffffff',
                  flexShrink: 0,
                }}
              >
                {rep.senderName.charAt(0).toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#f4f4f5' }}>
                    {rep.senderName}
                  </span>
                  <span style={{ fontSize: 10, color: '#71717a' }}>
                    {new Date(rep.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div style={{ fontSize: 13, color: '#e4e4e7', lineHeight: '1.4' }}>
                  {rep.content}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Thread Composer */}
      <MessageComposer
        channelName="thread"
        placeholder="Reply to thread..."
        onSendMessage={handleSendReply}
        onTyping={() => {}}
      />
    </aside>
  );
};
