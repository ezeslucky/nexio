import React, { useState, useRef, useEffect } from 'react';
import type { DiagramItem, DiagramChatMessage } from '../types';
import { applyAiEditToDiagram } from '../services/ai-diagram-service';

interface DiagramAiChatProps {
  diagram: DiagramItem;
  onApplyDiagramChange: (updated: DiagramItem, actionSummary: string) => void;
  onClose: () => void;
}

export const DiagramAiChat: React.FC<DiagramAiChatProps> = ({
  diagram,
  onApplyDiagramChange,
  onClose,
}) => {
  const [messages, setMessages] = useState<DiagramChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        'Hello! I am your AI Diagram Architect. You can ask me to add components (e.g. "Add a Redis cache", "Add an API Gateway"), route connections, audit single points of failure, or generate documentation.',
      timestamp: Date.now(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        role: 'assistant',
        content: `Hello! I am your AI Diagram Architect for "${diagram.title}". Ask me to add components (e.g. "Add a Redis cache", "Add an API Gateway"), route connections, audit single points of failure, or generate documentation.`,
        timestamp: Date.now(),
      },
    ]);
  }, [diagram.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  const handleSendMessage = async (promptText?: string) => {
    const text = promptText || inputValue;
    if (!text.trim() || isProcessing) return;

    const userMsg: DiagramChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!promptText) setInputValue('');
    setIsProcessing(true);

    try {
      // Simulate real AI synthesis delay
      await new Promise(resolve => setTimeout(resolve, 600));

      const { updatedDiagram, actionTaken, explanation } = applyAiEditToDiagram(
        diagram,
        userMsg.content
      );

      const assistantMsg: DiagramChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: explanation,
        timestamp: Date.now(),
        actionTaken,
      };

      setMessages(prev => [...prev, assistantMsg]);
      onApplyDiagramChange(updatedDiagram, actionTaken);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg-err-${Date.now()}`,
          role: 'assistant',
          content: `Failed to process request: ${err.message || 'Unknown error'}`,
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickPrompts = [
    { label: '⚡ Add Redis Cache', prompt: 'Add a Redis cache in front of the database' },
    { label: '⚖️ Add Load Balancer', prompt: 'Add an Application Load Balancer in front of the services' },
    { label: '🛡️ Add Rate Limiter', prompt: 'Add a Rate Limiter and API Gateway security layer' },
    { label: '📬 Add Kafka Queue', prompt: 'Add a Kafka message queue for asynchronous event processing' },
    { label: '🔍 Audit Single Points of Failure', prompt: 'Audit this architecture for single points of failure and bottlenecks' },
    { label: '📝 Explain Architecture', prompt: 'Explain this diagram and explain data flow between components' },
  ];

  return (
    <div
      style={{
        width: '360px',
        height: '100%',
        background: '#161b22',
        borderLeft: '1px solid #30363d',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 35,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, #161b22 0%, #1c2128 100%)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '26px',
              height: '26px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '13px',
            }}
          >
            ✨
          </div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f0f6fc' }}>
              AI Diagram Copilot
            </div>
            <div style={{ fontSize: '10px', color: '#8b949e' }}>
              Eraser-grade in-place architecture editing
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8b949e',
            cursor: 'pointer',
            fontSize: '18px',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          ×
        </button>
      </div>

      {/* Suggested Quick Prompts */}
      <div
        style={{
          padding: '10px 14px',
          borderBottom: '1px solid #21262d',
          background: '#0d1117',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          whiteSpace: 'nowrap',
        }}
      >
        {quickPrompts.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(item.prompt)}
            disabled={isProcessing}
            style={{
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '20px',
              padding: '4px 10px',
              color: '#c9d1d9',
              fontSize: '11px',
              fontWeight: 500,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              flexShrink: 0,
            }}
            onMouseEnter={e => {
              if (!isProcessing) e.currentTarget.style.borderColor = '#6366f1';
            }}
            onMouseLeave={e => {
              if (!isProcessing) e.currentTarget.style.borderColor = '#30363d';
            }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Chat Messages Log */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.map(msg => (
          <div
            key={msg.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start',
            }}
          >
            <div
              style={{
                maxWidth: '88%',
                padding: '10px 14px',
                borderRadius: '12px',
                background:
                  msg.role === 'user'
                    ? '#238636'
                    : msg.role === 'system'
                      ? '#21262d'
                      : '#1c2128',
                border: msg.role === 'user' ? 'none' : '1px solid #30363d',
                color: '#f0f6fc',
                fontSize: '12px',
                lineHeight: 1.5,
                whiteSpace: 'pre-wrap',
                boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
              }}
            >
              {msg.actionTaken && (
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(99, 102, 241, 0.2)',
                    color: '#818cf8',
                    fontWeight: 600,
                    fontSize: '10px',
                    marginBottom: '6px',
                  }}
                >
                  <span>⚡</span>
                  <span>{msg.actionTaken}</span>
                </div>
              )}
              <div>{msg.content}</div>
            </div>
            <span
              style={{
                fontSize: '9px',
                color: '#484f58',
                marginTop: '4px',
                padding: '0 4px',
              }}
            >
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
        ))}

        {isProcessing && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              borderRadius: '12px',
              background: '#1c2128',
              border: '1px solid #30363d',
              color: '#8b949e',
              fontSize: '12px',
              maxWidth: '80%',
            }}
          >
            <span style={{ animation: 'spin 1s infinite linear' }}>✨</span>
            <span>Reasoning & modifying diagram...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #30363d',
          background: '#0d1117',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <input
            type="text"
            placeholder="Ask AI to modify or explain diagram..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') handleSendMessage();
            }}
            disabled={isProcessing}
            style={{
              flex: 1,
              background: '#161b22',
              border: '1px solid #30363d',
              borderRadius: '8px',
              padding: '8px 12px',
              color: '#f0f6fc',
              fontSize: '12px',
              outline: 'none',
            }}
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isProcessing}
            style={{
              background: inputValue.trim() && !isProcessing ? '#6366f1' : '#21262d',
              border: 'none',
              borderRadius: '8px',
              padding: '0 14px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: inputValue.trim() && !isProcessing ? 'pointer' : 'not-allowed',
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

