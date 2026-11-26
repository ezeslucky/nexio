import { useEffect, useRef, useState } from 'react';
import type { ChatAttachment } from './types';

interface MessageComposerProps {
  channelName: string;
  onSendMessage: (content: string, attachments: ChatAttachment[]) => void;
  onTyping: (isTyping: boolean) => void;
  placeholder?: string;
}

export const MessageComposer = ({
  channelName,
  onSendMessage,
  onTyping,
  placeholder,
}: MessageComposerProps) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);
  const typingTimeoutRef = useRef<any>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    onTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      onTyping(false);
    }, 2500);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleSend = () => {
    if (!content.trim() && attachments.length === 0) return;
    onSendMessage(content.trim(), attachments);
    setContent('');
    setAttachments([]);
    onTyping(false);
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSimulateAttachment = () => {
    const mockFiles = [
      { name: 'architecture-diagram.png', size: 245000, mimeType: 'image/png' },
      { name: 'sprint-1-requirements.pdf', size: 128000, mimeType: 'application/pdf' },
      { name: 'module-contracts.ts', size: 14200, mimeType: 'text/typescript' },
    ];
    const picked = mockFiles[Math.floor(Math.random() * mockFiles.length)];
    const newAtt: ChatAttachment = {
      id: `att-${Date.now()}`,
      name: picked.name,
      size: picked.size,
      mimeType: picked.mimeType,
      url: '#',
    };
    setAttachments(prev => [...prev, newAtt]);
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div
      style={{
        padding: '12px 24px 16px',
        backgroundColor: 'var(--affine-background-primary-color, #121214)',
        borderTop: '1px solid var(--affine-border-color, rgba(255,255,255,0.08))',
      }}
    >
      {/* Attachment Chips */}
      {attachments.length > 0 && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
          {attachments.map(att => (
            <div
              key={att.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '4px 8px',
                borderRadius: 6,
                backgroundColor: 'rgba(59, 130, 246, 0.15)',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                fontSize: 12,
                color: '#93c5fd',
              }}
            >
              <span>📎 {att.name}</span>
              <button
                onClick={() => removeAttachment(att.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#93c5fd',
                  cursor: 'pointer',
                  fontSize: 12,
                  padding: 0,
                  marginLeft: 4,
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Input Box Container */}
      <div
        style={{
          border: '1px solid var(--affine-border-color, rgba(255,255,255,0.12))',
          borderRadius: 8,
          backgroundColor: 'var(--affine-background-secondary-color, #18181b)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <textarea
          rows={2}
          value={content}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || `Message #${channelName} (Enter to send, Shift+Enter for new line)`}
          style={{
            width: '100%',
            padding: '10px 12px',
            fontSize: 13,
            lineHeight: '1.5',
            backgroundColor: 'transparent',
            border: 'none',
            color: '#ffffff',
            outline: 'none',
            resize: 'none',
            boxSizing: 'border-box',
          }}
        />

        {/* Toolbar Row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '6px 10px',
            borderTop: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              type="button"
              onClick={handleSimulateAttachment}
              title="Attach File"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#a1a1aa',
                fontSize: 14,
                padding: '3px 6px',
                borderRadius: 4,
              }}
            >
              📎
            </button>
            <button
              type="button"
              onClick={() => setContent(prev => prev + '@')}
              title="Mention user (@)"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#a1a1aa',
                fontSize: 13,
                fontWeight: 600,
                padding: '3px 6px',
                borderRadius: 4,
              }}
            >
              @
            </button>
            <button
              type="button"
              onClick={() => setContent(prev => prev + ' 🚀')}
              title="Quick emoji"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#a1a1aa',
                fontSize: 14,
                padding: '3px 6px',
                borderRadius: 4,
              }}
            >
              😀
            </button>
          </div>

          {/* Send button */}
          <button
            type="button"
            onClick={handleSend}
            disabled={!content.trim() && attachments.length === 0}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '5px 12px',
              borderRadius: 6,
              border: 'none',
              backgroundColor:
                content.trim() || attachments.length > 0
                  ? 'var(--affine-primary-color, #3b82f6)'
                  : 'rgba(255,255,255,0.1)',
              color: content.trim() || attachments.length > 0 ? '#ffffff' : '#71717a',
              fontWeight: 600,
              fontSize: 12,
              cursor: content.trim() || attachments.length > 0 ? 'pointer' : 'not-allowed',
              transition: 'background 0.15s ease',
            }}
          >
            <span>Send</span>
            <span>↵</span>
          </button>
        </div>
      </div>
    </div>
  );
};
