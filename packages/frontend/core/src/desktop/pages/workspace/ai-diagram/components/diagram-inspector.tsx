import React, { useState } from 'react';
import type { DiagramItem, DiagramNode, DiagramEdge, NodeShape, ERDColumn, DiagramType } from '../types';
import { SHAPE_LABELS, COLOR_PALETTES, DIAGRAM_TYPE_LABELS } from '../defaults';

interface DiagramInspectorProps {
  diagram: DiagramItem;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onUpdateNode: (node: DiagramNode) => void;
  onUpdateEdge: (edge: DiagramEdge) => void;
  onUpdateDiagramMeta: (updates: Partial<DiagramItem>) => void;
  onDeleteSelected: () => void;
  onSelectNode: (nodeId: string | null) => void;
  onSelectEdge: (edgeId: string | null) => void;
  onClose: () => void;
}

export const DiagramInspector: React.FC<DiagramInspectorProps> = ({
  diagram,
  selectedNodeId,
  selectedEdgeId,
  onUpdateNode,
  onUpdateEdge,
  onUpdateDiagramMeta,
  onDeleteSelected,
  onSelectNode,
  onSelectEdge,
  onClose,
}) => {
  const selectedNode = diagram.nodes.find(n => n.id === selectedNodeId);
  const selectedEdge = diagram.edges.find(e => e.id === selectedEdgeId);

  // New ERD Column state
  const [newColName, setNewColName] = useState('');
  const [newColType, setNewColType] = useState('varchar(255)');
  const [newColPk, setNewColPk] = useState(false);
  const [newColFk, setNewColFk] = useState(false);

  const handleAddColumn = () => {
    if (!selectedNode || !newColName.trim()) return;
    const currentCols = selectedNode.columns || [];
    const newCol: ERDColumn = {
      name: newColName.trim(),
      type: newColType.trim() || 'varchar(255)',
      isPrimary: newColPk,
      isForeign: newColFk,
    };
    onUpdateNode({
      ...selectedNode,
      columns: [...currentCols, newCol],
      height: Math.max((selectedNode.height || 100) + 26, 120),
    });
    setNewColName('');
    setNewColPk(false);
    setNewColFk(false);
  };

  const handleRemoveColumn = (colIdx: number) => {
    if (!selectedNode || !selectedNode.columns) return;
    const updated = selectedNode.columns.filter((_, idx) => idx !== colIdx);
    onUpdateNode({
      ...selectedNode,
      columns: updated,
    });
  };

  return (
    <div
      style={{
        width: '320px',
        height: '100%',
        background: '#161b22',
        borderLeft: '1px solid #30363d',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 35,
        overflowY: 'auto',
      }}
    >
      {/* Sidebar Header */}
      <div
        style={{
          padding: '14px 16px',
          borderBottom: '1px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px' }}>
            {selectedNode ? '⚙️' : selectedEdge ? '🔗' : '📊'}
          </span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f0f6fc' }}>
            {selectedNode
              ? 'Node Properties'
              : selectedEdge
                ? 'Edge Connection'
                : 'Diagram Settings'}
          </span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8b949e',
            cursor: 'pointer',
            fontSize: '16px',
            padding: '2px 6px',
            borderRadius: '4px',
          }}
        >
          ×
        </button>
      </div>

      {/* Content Area */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* CASE 1: NODE SELECTED */}
        {selectedNode && (
          <>
            {/* Label */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                LABEL
              </label>
              <input
                type="text"
                value={selectedNode.label}
                onChange={e => onUpdateNode({ ...selectedNode, label: e.target.value })}
                style={{
                  width: '100%',
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  color: '#f0f6fc',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Description */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                DESCRIPTION
              </label>
              <textarea
                rows={2}
                value={selectedNode.description || ''}
                onChange={e => onUpdateNode({ ...selectedNode, description: e.target.value })}
                style={{
                  width: '100%',
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  color: '#f0f6fc',
                  fontSize: '12px',
                  outline: 'none',
                  resize: 'none',
                }}
              />
            </div>

            {/* Technology & Badge */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                  TECH / STACK
                </label>
                <input
                  type="text"
                  placeholder="e.g. NestJS"
                  value={selectedNode.tech || ''}
                  onChange={e => onUpdateNode({ ...selectedNode, tech: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    color: '#f0f6fc',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                  BADGE
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cluster A"
                  value={selectedNode.badge || ''}
                  onChange={e => onUpdateNode({ ...selectedNode, badge: e.target.value })}
                  style={{
                    width: '100%',
                    background: '#0d1117',
                    border: '1px solid #30363d',
                    borderRadius: '6px',
                    padding: '6px 8px',
                    color: '#f0f6fc',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Shape Selector */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                NODE SHAPE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {(Object.keys(SHAPE_LABELS) as NodeShape[]).map(shape => (
                  <button
                    key={shape}
                    onClick={() => onUpdateNode({ ...selectedNode, shape })}
                    style={{
                      background: selectedNode.shape === shape ? 'rgba(56, 189, 248, 0.15)' : '#0d1117',
                      border: `1px solid ${selectedNode.shape === shape ? '#38bdf8' : '#30363d'}`,
                      borderRadius: '6px',
                      padding: '6px 4px',
                      color: selectedNode.shape === shape ? '#38bdf8' : '#c9d1d9',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textAlign: 'center',
                    }}
                  >
                    {SHAPE_LABELS[shape]}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Accent Picker */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                ACCENT COLOR
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {COLOR_PALETTES.map(p => (
                  <div
                    key={p.name}
                    onClick={() => onUpdateNode({ ...selectedNode, color: p.border, bg: p.bg })}
                    title={p.name}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '6px',
                      background: p.bg,
                      border: `2px solid ${p.border}`,
                      cursor: 'pointer',
                      transform: selectedNode.color === p.border ? 'scale(1.2)' : 'scale(1)',
                      transition: 'transform 0.15s ease',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* ERD Schema Columns Editor (if has columns or user wants to add) */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e' }}>
                  SCHEMA / COLUMNS ({selectedNode.columns?.length || 0})
                </label>
              </div>

              {/* Columns List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '8px' }}>
                {selectedNode.columns?.map((col, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: '#0d1117',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      border: '1px solid #21262d',
                      fontSize: '11px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {col.isPrimary && <span title="Primary Key">🔑</span>}
                      {col.isForeign && <span title="Foreign Key">🔗</span>}
                      <span style={{ color: '#f0f6fc', fontFamily: 'monospace' }}>{col.name}</span>
                      <span style={{ color: '#8b949e', fontSize: '10px' }}>({col.type})</span>
                    </div>
                    <button
                      onClick={() => handleRemoveColumn(idx)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#f85149',
                        cursor: 'pointer',
                        fontSize: '13px',
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Column Mini Form */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#0d1117', padding: '8px', borderRadius: '6px', border: '1px solid #30363d' }}>
                <input
                  type="text"
                  placeholder="Column name (e.g. user_id)"
                  value={newColName}
                  onChange={e => setNewColName(e.target.value)}
                  style={{
                    background: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: '#f0f6fc',
                    fontSize: '11px',
                    outline: 'none',
                  }}
                />
                <input
                  type="text"
                  placeholder="Type (e.g. uuid, int, varchar)"
                  value={newColType}
                  onChange={e => setNewColType(e.target.value)}
                  style={{
                    background: '#161b22',
                    border: '1px solid #30363d',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: '#f0f6fc',
                    fontSize: '11px',
                    outline: 'none',
                  }}
                />
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#c9d1d9', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newColPk} onChange={e => setNewColPk(e.target.checked)} />
                    Primary Key (PK)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#c9d1d9', cursor: 'pointer' }}>
                    <input type="checkbox" checked={newColFk} onChange={e => setNewColFk(e.target.checked)} />
                    Foreign Key (FK)
                  </label>
                </div>
                <button
                  onClick={handleAddColumn}
                  style={{
                    background: '#238636',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '4px 8px',
                    color: '#fff',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    marginTop: '2px',
                  }}
                >
                  + Add Column
                </button>
              </div>
            </div>

            {/* Delete Node */}
            <button
              onClick={onDeleteSelected}
              style={{
                marginTop: '10px',
                background: 'rgba(248, 81, 73, 0.1)',
                border: '1px solid #f85149',
                borderRadius: '6px',
                padding: '8px',
                color: '#f85149',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Delete Node
            </button>
          </>
        )}

        {/* CASE 2: EDGE SELECTED */}
        {selectedEdge && (
          <>
            {/* Edge Label */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                CONNECTION LABEL
              </label>
              <input
                type="text"
                placeholder="e.g. Fetches User Data"
                value={selectedEdge.label || ''}
                onChange={e => onUpdateEdge({ ...selectedEdge, label: e.target.value })}
                style={{
                  width: '100%',
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  color: '#f0f6fc',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Protocol Badge */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                PROTOCOL / PORT
              </label>
              <input
                type="text"
                placeholder="e.g. gRPC, HTTPS, Port 5432"
                value={selectedEdge.protocol || ''}
                onChange={e => onUpdateEdge({ ...selectedEdge, protocol: e.target.value })}
                style={{
                  width: '100%',
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  color: '#f0f6fc',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            {/* Line Style */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                LINE ROUTING STYLE
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
                {(['curved', 'orthogonal', 'straight'] as const).map(style => (
                  <button
                    key={style}
                    onClick={() => onUpdateEdge({ ...selectedEdge, style })}
                    style={{
                      background: (selectedEdge.style || 'curved') === style ? 'rgba(56, 189, 248, 0.15)' : '#0d1117',
                      border: `1px solid ${(selectedEdge.style || 'curved') === style ? '#38bdf8' : '#30363d'}`,
                      borderRadius: '6px',
                      padding: '6px 4px',
                      color: (selectedEdge.style || 'curved') === style ? '#38bdf8' : '#c9d1d9',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textTransform: 'capitalize',
                    }}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Animation Toggle */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ fontSize: '12px', color: '#c9d1d9' }}>Flow Animation</span>
              <input
                type="checkbox"
                checked={selectedEdge.animated ?? true}
                onChange={e => onUpdateEdge({ ...selectedEdge, animated: e.target.checked })}
              />
            </div>

            {/* Delete Edge */}
            <button
              onClick={onDeleteSelected}
              style={{
                marginTop: '10px',
                background: 'rgba(248, 81, 73, 0.1)',
                border: '1px solid #f85149',
                borderRadius: '6px',
                padding: '8px',
                color: '#f85149',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Delete Edge
            </button>
          </>
        )}

        {/* CASE 3: DIAGRAM SETTINGS (Nothing selected) */}
        {!selectedNode && !selectedEdge && (
          <>
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                DIAGRAM TITLE
              </label>
              <input
                type="text"
                value={diagram.title}
                onChange={e => onUpdateDiagramMeta({ title: e.target.value })}
                style={{
                  width: '100%',
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  color: '#f0f6fc',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                DIAGRAM TYPE
              </label>
              <select
                value={diagram.diagramType}
                onChange={e => onUpdateDiagramMeta({ diagramType: e.target.value as DiagramType })}
                style={{
                  width: '100%',
                  background: '#0d1117',
                  border: '1px solid #30363d',
                  borderRadius: '6px',
                  padding: '7px 10px',
                  color: '#f0f6fc',
                  fontSize: '12px',
                  outline: 'none',
                }}
              >
                {Object.entries(DIAGRAM_TYPE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.icon} {v.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                CANVAS STATS
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  background: '#0d1117',
                  padding: '10px',
                  borderRadius: '8px',
                  border: '1px solid #21262d',
                }}
              >
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#58a6ff' }}>
                    {diagram.nodes.length}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>Total Nodes</div>
                </div>
                <div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#6366f1' }}>
                    {diagram.edges.length}
                  </div>
                  <div style={{ fontSize: '11px', color: '#8b949e' }}>Connections</div>
                </div>
              </div>
            </div>

            {/* Layers / Nodes List */}
            <div>
              <label style={{ fontSize: '11px', fontWeight: 600, color: '#8b949e', display: 'block', marginBottom: '6px' }}>
                LAYERS & ELEMENTS ({diagram.nodes.length})
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '200px', overflowY: 'auto' }}>
                {diagram.nodes.map(n => (
                  <div
                    key={n.id}
                    onClick={() => {
                      onSelectNode(n.id);
                      onSelectEdge(null);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '6px 8px',
                      borderRadius: '6px',
                      background: '#0d1117',
                      border: '1px solid #21262d',
                      fontSize: '12px',
                      color: '#c9d1d9',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#21262d')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#0d1117')}
                  >
                    <span>{n.icon || '⚡'}</span>
                    <span style={{ fontWeight: 500, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {n.label}
                    </span>
                    <span style={{ fontSize: '10px', color: '#8b949e', fontFamily: 'monospace' }}>
                      {n.tech || n.shape}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

