import React, { useState, useEffect } from 'react';
import type { DiagramItem, DiagramNode } from '../types';
import { DIAGRAM_TYPE_LABELS } from '../defaults';

interface DiagramToolbarProps {
  diagram: DiagramItem;
  toolMode: 'select' | 'pan' | 'connect';
  onSetToolMode: (mode: 'select' | 'pan' | 'connect') => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showMinimap: boolean;
  onToggleMinimap: () => void;
  showCodeView: boolean;
  onToggleCodeView: () => void;
  traceDependencies: boolean;
  onToggleTraceDependencies: () => void;
  showAiChat: boolean;
  onToggleAiChat: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onAutoLayout: () => void;
  onAddNode: (partialNode?: Partial<DiagramNode>) => void;
  onRenameDiagram: (newTitle: string) => void;
  onBackToDashboard: () => void;
  onOpenShareModal: () => void;
  onExport: (format: 'png' | 'svg' | 'json') => void;
}

export const DiagramToolbar: React.FC<DiagramToolbarProps> = ({
  diagram,
  toolMode,
  onSetToolMode,
  showGrid,
  onToggleGrid,
  showMinimap,
  onToggleMinimap,
  showCodeView,
  onToggleCodeView,
  traceDependencies,
  onToggleTraceDependencies,
  showAiChat,
  onToggleAiChat,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onAutoLayout,
  onAddNode,
  onRenameDiagram,
  onBackToDashboard,
  onOpenShareModal,
  onExport,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(diagram.title);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    setTitleInput(diagram.title);
  }, [diagram.title]);

  const typeConfig = DIAGRAM_TYPE_LABELS[diagram.diagramType] || {
    label: diagram.diagramType,
    icon: '📊',
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (titleInput.trim()) {
      onRenameDiagram(titleInput.trim());
    } else {
      setTitleInput(diagram.title);
    }
  };

  return (
    <div
      style={{
        height: '52px',
        background: '#161b22',
        borderBottom: '1px solid #30363d',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        zIndex: 40,
        position: 'relative',
      }}
    >
      {/* Left Section: Back + Title & Meta */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={onBackToDashboard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'transparent',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '4px 10px',
            color: '#c9d1d9',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background 0.15s ease',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#21262d')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <span>←</span>
          <span>Dashboard</span>
        </button>

        <div style={{ width: '1px', height: '20px', background: '#30363d' }} />

        {/* Inline Editable Title */}
        {isEditingTitle ? (
          <input
            autoFocus
            type="text"
            value={titleInput}
            onChange={e => setTitleInput(e.target.value)}
            onBlur={handleTitleSubmit}
            onKeyDown={e => {
              if (e.key === 'Enter') handleTitleSubmit();
              if (e.key === 'Escape') {
                setTitleInput(diagram.title);
                setIsEditingTitle(false);
              }
            }}
            style={{
              background: '#0d1117',
              border: '1px solid #58a6ff',
              borderRadius: '6px',
              padding: '3px 8px',
              color: '#f0f6fc',
              fontSize: '14px',
              fontWeight: 600,
              outline: 'none',
              minWidth: '220px',
            }}
          />
        ) : (
          <div
            onClick={() => {
              setTitleInput(diagram.title);
              setIsEditingTitle(true);
            }}
            title="Click to rename"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              padding: '3px 6px',
              borderRadius: '6px',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#21262d')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ fontSize: '15px' }}>{typeConfig.icon}</span>
            <span
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#f0f6fc',
              }}
            >
              {diagram.title}
            </span>
            <span
              style={{
                fontSize: '11px',
                color: '#8b949e',
                background: '#21262d',
                padding: '2px 6px',
                borderRadius: '4px',
                fontFamily: 'monospace',
              }}
            >
              {typeConfig.label}
            </span>
          </div>
        )}
      </div>

      {/* Middle Section: Tools & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Tool Mode: Select & Pan */}
        <div
          style={{
            display: 'flex',
            background: '#0d1117',
            padding: '2px',
            borderRadius: '6px',
            border: '1px solid #30363d',
          }}
        >
          <button
            onClick={() => onSetToolMode('select')}
            title="Select Mode (V)"
            style={{
              padding: '4px 10px',
              border: 'none',
              borderRadius: '4px',
              background: toolMode === 'select' ? '#238636' : 'transparent',
              color: toolMode === 'select' ? '#fff' : '#8b949e',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Select
          </button>
          <button
            onClick={() => onSetToolMode('pan')}
            title="Pan Hand (H)"
            style={{
              padding: '4px 10px',
              border: 'none',
              borderRadius: '4px',
              background: toolMode === 'pan' ? '#238636' : 'transparent',
              color: toolMode === 'pan' ? '#fff' : '#8b949e',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Pan
          </button>
        </div>

        {/* Add Node Menu */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowAddMenu(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#238636',
              border: 'none',
              borderRadius: '6px',
              padding: '5px 12px',
              color: '#fff',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <span>+</span>
            <span>Add Node</span>
            <span style={{ fontSize: '10px' }}>▼</span>
          </button>

          {showAddMenu && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                onClick={() => setShowAddMenu(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '36px',
                  left: 0,
                  width: '210px',
                  background: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  zIndex: 50,
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
              {[
                { label: 'Service / Microservice', icon: '⚙️', shape: 'rounded', tech: 'Node.js' },
                { label: 'API Gateway / Ingress', icon: '🌐', shape: 'rounded', tech: 'Kong / Envoy' },
                { label: 'SQL / Relational DB', icon: '🗄️', shape: 'cylinder', tech: 'PostgreSQL' },
                { label: 'Redis / Cache', icon: '⚡', shape: 'cylinder', tech: 'Redis Cache' },
                { label: 'Kafka / Queue', icon: '📬', shape: 'queue', tech: 'Apache Kafka' },
                { label: 'Cloud Storage / S3', icon: '☁️', shape: 'cloud', tech: 'AWS S3' },
                {
                  label: 'ERD Database Table',
                  icon: '🗃️',
                  shape: 'rectangle',
                  columns: [
                    { name: 'id', type: 'uuid', isPrimary: true },
                    { name: 'name', type: 'varchar(255)' },
                    { name: 'created_at', type: 'timestamp' },
                  ],
                },
                { label: 'Decision Logic', icon: '💎', shape: 'diamond' },
              ].map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setShowAddMenu(false);
                    onAddNode({
                      label: item.label.split(' / ')[0],
                      icon: item.icon,
                      shape: item.shape as any,
                      tech: (item as any).tech,
                      columns: (item as any).columns,
                    });
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    border: 'none',
                    borderRadius: '6px',
                    background: 'transparent',
                    color: '#c9d1d9',
                    fontSize: '12px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#21262d')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: '14px' }}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
            </>
          )}
        </div>

        {/* Auto Layout */}
        <button
          onClick={onAutoLayout}
          title="Auto arrange nodes neatly"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: 'transparent',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '5px 10px',
            color: '#c9d1d9',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
          onMouseEnter={e => (e.currentTarget.style.background = '#21262d')}
          onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
        >
          <span>✨</span>
          <span>Auto Layout</span>
        </button>

        {/* Trace Dependencies */}
        <button
          onClick={onToggleTraceDependencies}
          title="Highlight upstream & downstream connections"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: traceDependencies ? 'rgba(236, 72, 153, 0.15)' : 'transparent',
            border: `1px solid ${traceDependencies ? '#ec4899' : '#30363d'}`,
            borderRadius: '6px',
            padding: '5px 10px',
            color: traceDependencies ? '#f472b6' : '#c9d1d9',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <span>⚡</span>
          <span>Trace</span>
        </button>

        {/* Undo & Redo */}
        <div style={{ display: 'flex', gap: '2px' }}>
          <button
            disabled={!canUndo}
            onClick={onUndo}
            title="Undo (Ctrl+Z)"
            style={{
              background: 'transparent',
              border: '1px solid #30363d',
              borderRadius: '6px 0 0 6px',
              padding: '5px 8px',
              color: canUndo ? '#c9d1d9' : '#484f58',
              fontSize: '12px',
              cursor: canUndo ? 'pointer' : 'not-allowed',
            }}
          >
            ↩
          </button>
          <button
            disabled={!canRedo}
            onClick={onRedo}
            title="Redo (Ctrl+Y)"
            style={{
              background: 'transparent',
              border: '1px solid #30363d',
              borderRadius: '0 6px 6px 0',
              padding: '5px 8px',
              color: canRedo ? '#c9d1d9' : '#484f58',
              fontSize: '12px',
              cursor: canRedo ? 'pointer' : 'not-allowed',
              borderLeft: 'none',
            }}
          >
            ↪
          </button>
        </div>

        {/* View Toggles: Grid, Minimap, Code */}
        <button
          onClick={onToggleGrid}
          title="Toggle Canvas Grid"
          style={{
            background: showGrid ? '#21262d' : 'transparent',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '5px 8px',
            color: showGrid ? '#58a6ff' : '#8b949e',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          ▦
        </button>

        <button
          onClick={onToggleMinimap}
          title="Toggle Minimap"
          style={{
            background: showMinimap ? '#21262d' : 'transparent',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '5px 8px',
            color: showMinimap ? '#58a6ff' : '#8b949e',
            fontSize: '12px',
            cursor: 'pointer',
          }}
        >
          🗺️
        </button>

        <button
          onClick={onToggleCodeView}
          title="Diagram as Code (Mermaid / JSON)"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            background: showCodeView ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
            border: `1px solid ${showCodeView ? '#38bdf8' : '#30363d'}`,
            borderRadius: '6px',
            padding: '5px 10px',
            color: showCodeView ? '#38bdf8' : '#c9d1d9',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          <span>&lt;/&gt;</span>
          <span>Code</span>
        </button>
      </div>

      {/* Right Section: AI Assistant + Export + Share */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* AI Assistant Toggle Button */}
        <button
          onClick={onToggleAiChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: showAiChat
              ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
              : 'rgba(99, 102, 241, 0.15)',
            border: '1px solid #6366f1',
            borderRadius: '6px',
            padding: '5px 12px',
            color: showAiChat ? '#fff' : '#818cf8',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            boxShadow: showAiChat
              ? '0 0 12px rgba(99, 102, 241, 0.5)'
              : 'none',
          }}
        >
          <span>✨</span>
          <span>AI Assistant</span>
        </button>

        {/* Export Dropdown */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowExportMenu(prev => !prev)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'transparent',
              border: '1px solid #30363d',
              borderRadius: '6px',
              padding: '5px 10px',
              color: '#c9d1d9',
              fontSize: '12px',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            <span>⬇️</span>
            <span>Export</span>
          </button>

          {showExportMenu && (
            <>
              <div
                style={{ position: 'fixed', inset: 0, zIndex: 45 }}
                onClick={() => setShowExportMenu(false)}
              />
              <div
                style={{
                  position: 'absolute',
                  top: '36px',
                  right: 0,
                  width: '160px',
                  background: '#161b22',
                  border: '1px solid #30363d',
                  borderRadius: '8px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
                  zIndex: 50,
                  padding: '6px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                }}
              >
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExport('svg');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  background: 'transparent',
                  color: '#c9d1d9',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#21262d')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span>🎨</span>
                <span>Export SVG</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExport('png');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  background: 'transparent',
                  color: '#c9d1d9',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#21262d')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span>🖼️</span>
                <span>Export PNG</span>
              </button>
              <button
                onClick={() => {
                  setShowExportMenu(false);
                  onExport('json');
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '7px 10px',
                  border: 'none',
                  borderRadius: '6px',
                  background: 'transparent',
                  color: '#c9d1d9',
                  fontSize: '12px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = '#21262d')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <span>📄</span>
                <span>Export JSON</span>
              </button>
            </div>
            </>
          )}
        </div>

        {/* Share Button */}
        <button
          onClick={onOpenShareModal}
          style={{
            background: '#238636',
            border: 'none',
            borderRadius: '6px',
            padding: '5px 12px',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Share
        </button>
      </div>
    </div>
  );
};

