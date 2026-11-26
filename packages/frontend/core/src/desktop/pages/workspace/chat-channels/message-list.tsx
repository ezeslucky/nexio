import { useEffect, useRef } from 'react';
import type { ChatMessage } from './types';

interface MessageListProps {
  messages: ChatMessage[];
  currentUserName: string;
  onToggleReaction: (messageId: string, emoji: string) => void;
  onOpenThread: (message: ChatMessage) => void;
}

const QUICK_EMOJIS = ['👍', '❤️', '🚀', '🎉', '🔥'];

const formatTimestamp = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return dateStr;
  }
};

const renderFormattedContent = (content: string, mentions: string[]) => {
  const words = content.split(' ');
  return words.map((word, i) => {
    if (word.startsWith('@')) {
      return (
        <span
          key={i}
          style={{
            color: 'var(--affine-primary-color, #60a5fa)',
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            padding: '1px 5px',
            borderRadius: 4,
            fontWeight: 600,
            display: 'inline-block',
            margin: '0 2px',
          }}
        >
          {word}
        </span>
      );
    }
    return word + ' ';
  });
};

export const MessageList = ({
  messages,
  currentUserName,
  onToggleReaction,
  onOpenThread,
}: MessageListProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  return (
    <div
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
      }}
    >
      {messages.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#71717a',
            fontSize: 14,
          }}
        >
          <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
          <div>No messages in this channel yet.</div>
          <div style={{ fontSize: 12, marginTop: 4 }}>Be the first to say hello!</div>
        </div>
      ) : (
        messages.map(msg => {
          return (
            <div
              key={msg.id}
              style={{
                display: 'flex',
                gap: 12,
                position: 'relative',
                padding: '6px 8px',
                borderRadius: 8,
                transition: 'background 0.15s ease',
              }}
              className="message-item"
            >
              {/* Avatar */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: '#3b82f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 14,
                  color: '#ffffff',
                  flexShrink: 0,
                }}
              >
                {msg.senderName.charAt(0).toUpperCase()}
              </div>

              {/* Body */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Header: Sender & Time */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: '#f4f4f5' }}>
                    {msg.senderName}
                  </span>
                  <span style={{ fontSize: 11, color: '#71717a' }}>
                    {formatTimestamp(msg.createdAt)}
                  </span>
                </div>

                {/* Content */}
                <div
                  style={{
                    fontSize: 14,
                    lineHeight: '1.5',
                    color: '#e4e4e7',
                    wordBreak: 'break-word',
                  }}
                >
                  {renderFormattedContent(msg.content, msg.mentions)}
                </div>

                {/* Attachments */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
                    {msg.attachments.map(att => (
                      <div
                        key={att.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                          padding: '6px 10px',
                          borderRadius: 6,
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          border: '1px solid rgba(255,255,255,0.1)',
                          fontSize: 12,
                          color: '#e4e4e7',
                        }}
                      >
                        <span>📎</span>
                        <span style={{ fontWeight: 500 }}>{att.name}</span>
                        <span style={{ color: '#71717a', fontSize: 11 }}>
                          ({(att.size / 1024).toFixed(1)} KB)
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reactions & Actions Row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {/* Reaction chips */}
                  {msg.reactions &&
                    msg.reactions.map(rx => {
                      const hasReacted = rx.users.includes(currentUserName);
                      return (
                        <button
                          key={rx.emoji}
                          onClick={() => onToggleReaction(msg.id, rx.emoji)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4,
                            padding: '3px 8px',
                            borderRadius: 12,
                            fontSize: 12,
                            backgroundColor: hasReacted
                              ? 'rgba(59, 130, 246, 0.25)'
                              : 'rgba(255, 255, 255, 0.05)',
                            border: hasReacted
                              ? '1px solid var(--affine-primary-color, #3b82f6)'
                              : '1px solid rgba(255, 255, 255, 0.08)',
                            color: hasReacted ? '#60a5fa' : '#a1a1aa',
                            cursor: 'pointer',
                          }}
                        >
                          <span>{rx.emoji}</span>
                          <span>{rx.count}</span>
                        </button>
                      );
                    })}

                  {/* Quick emoji reaction pickers */}
                  <div style={{ display: 'inline-flex', gap: 2, marginLeft: 4 }}>
                    {QUICK_EMOJIS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => onToggleReaction(msg.id, emoji)}
                        title={`React with ${emoji}`}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '2px 4px',
                          fontSize: 12,
                          opacity: 0.6,
                          borderRadius: 4,
                          transition: 'opacity 0.1s ease',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
                        onMouseLeave={e => (e.currentTarget.style.opacity = '0.6')}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>

                  {/* Thread reply trigger */}
                  <button
                    onClick={() => onOpenThread(msg)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 12,
                      background: 'none',
                      border: 'none',
                      color: msg.threadCount > 0 ? '#60a5fa' : '#71717a',
                      fontWeight: msg.threadCount > 0 ? 600 : 400,
                      cursor: 'pointer',
                      marginLeft: 8,
                    }}
                  >
                    <span>💬</span>
                    <span>
                      {msg.threadCount > 0
                        ? `${msg.threadCount} ${msg.threadCount === 1 ? 'reply' : 'replies'}`
                        : 'Reply'}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
      <div ref={bottomRef} />
    </div>
  );
};
