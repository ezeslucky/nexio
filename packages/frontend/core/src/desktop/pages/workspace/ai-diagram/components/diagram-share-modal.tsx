import React, { useState } from 'react';
import type { DiagramItem } from '../types';

interface DiagramShareModalProps {
  diagram: DiagramItem;
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: 'png' | 'svg' | 'json') => void;
}

export const DiagramShareModal: React.FC<DiagramShareModalProps> = ({
  diagram,
  isOpen,
  onClose,
  onExport,
}) => {
  const [accessLevel, setAccessLevel] = useState<'view' | 'clone'>('clone');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedEmbed, setCopiedEmbed] = useState(false);

  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/ai-diagram/${diagram.id}?access=${accessLevel}`;
  const embedCode = `<iframe src="${shareUrl}" width="100%" height="600" frameborder="0"></iframe>`;

  const copyToClipboard = (text: string, isEmbed = false) => {
    navigator.clipboard.writeText(text);
    if (isEmbed) {
      setCopiedEmbed(true);
      setTimeout(() => setCopiedEmbed(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '560px',
          background: '#161b22',
          border: '1px solid #30363d',
          borderRadius: '12px',
          boxShadow: '0 24px 48px rgba(0,0,0,0.6)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid #30363d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>🔗</span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#f0f6fc' }}>
              Share & Export Diagram
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#8b949e',
              cursor: 'pointer',
              fontSize: '18px',
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Share Link */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '8px' }}>
              PUBLIC SHARE LINK
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                readOnly
                value={shareUrl}
                style={{
                  flex: 1,
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#f0f6fc',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => copyToClipboard(shareUrl)}
                style={{
                  background: copiedLink ? '#238636' : '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  color: '#f0f6fc',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minWidth: '85px',
                }}
              >
                {copiedLink ? '✓ Copied' : 'Copy Link'}
              </button>
            </div>

            {/* Access Permission Toggle */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={() => setAccessLevel('clone')}
                style={{
                  background: accessLevel === 'clone' ? 'rgba(56, 189, 248, 0.15)' : '#0d1117',
                  border: `1px solid ${accessLevel === 'clone' ? '#38bdf8' : '#30363d'}`,
                  borderRadius: '6px',
                  padding: '4px 10px',
                  color: accessLevel === 'clone' ? '#38bdf8' : '#8b949e',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Can View & Clone
              </button>
              <button
                onClick={() => setAccessLevel('view')}
                style={{
                  background: accessLevel === 'view' ? 'rgba(56, 189, 248, 0.15)' : '#0d1117',
                  border: `1px solid ${accessLevel === 'view' ? '#38bdf8' : '#30363d'}`,
                  borderRadius: '6px',
                  padding: '4px 10px',
                  color: accessLevel === 'view' ? '#38bdf8' : '#8b949e',
                  fontSize: '11px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                View Only
              </button>
            </div>
          </div>

          {/* Embed Snippet */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '8px' }}>
              EMBED IN NOTION / WEB DOCS
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                readOnly
                value={embedCode}
                style={{
                  flex: 1,
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '8px 12px',
                  color: '#7ee787',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
              <button
                onClick={() => copyToClipboard(embedCode, true)}
                style={{
                  background: copiedEmbed ? '#238636' : '#21262d',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  color: '#f0f6fc',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  minWidth: '85px',
                }}
              >
                {copiedEmbed ? '✓ Copied' : 'Copy Embed'}
              </button>
            </div>
          </div>

          {/* Direct File Exports */}
          <div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '8px' }}>
              DIRECT DOWNLOADS
            </label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              <button
                onClick={() => {
                  onExport('svg');
                  onClose();
                }}
                style={{
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  color: '#f0f6fc',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#58a6ff')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#30363d')}
              >
                <span style={{ fontSize: '20px' }}>🎨</span>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Vector SVG</span>
                <span style={{ fontSize: '10px', color: '#8b949e' }}>Resolution Independent</span>
              </button>

              <button
                onClick={() => {
                  onExport('png');
                  onClose();
                }}
                style={{
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  color: '#f0f6fc',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#58a6ff')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#30363d')}
              >
                <span style={{ fontSize: '20px' }}>🖼️</span>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Raster PNG</span>
                <span style={{ fontSize: '10px', color: '#8b949e' }}>Transparent High-Res</span>
              </button>

              <button
                onClick={() => {
                  onExport('json');
                  onClose();
                }}
                style={{
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  color: '#f0f6fc',
                }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#58a6ff')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#30363d')}
              >
                <span style={{ fontSize: '20px' }}>📄</span>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>Diagram JSON</span>
                <span style={{ fontSize: '10px', color: '#8b949e' }}>Portable Spec</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 20px',
            borderTop: '1px solid #30363d',
            background: '#0d1117',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <button
            onClick={onClose}
            style={{
              background: '#21262d',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '6px 14px',
              color: '#c9d1d9',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

