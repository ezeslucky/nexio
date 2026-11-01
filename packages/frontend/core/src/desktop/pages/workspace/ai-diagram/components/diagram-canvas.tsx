import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { DiagramItem, DiagramNode, DiagramEdge, PortPosition } from '../types';

interface DiagramCanvasProps {
  diagram: DiagramItem;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onSelectEdge: (edgeId: string | null) => void;
  onUpdateNodes: (nodes: DiagramNode[]) => void;
  onAddEdge: (edge: DiagramEdge) => void;
  onDeleteSelected: () => void;
  toolMode: 'select' | 'pan' | 'connect';
  showGrid: boolean;
  showMinimap: boolean;
  traceDependencies: boolean;
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({
  diagram,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
  onUpdateNodes,
  onAddEdge,
  onDeleteSelected,
  toolMode,
  showGrid,
  showMinimap,
  traceDependencies,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Pan & Zoom state
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 120, y: 80 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // Node Dragging state
  const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  // Connecting state (drawing a new edge)
  const [connectingFrom, setConnectingFrom] = useState<{
    nodeId: string;
    port: PortPosition;
    startPos: { x: number; y: number };
  } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Hovered node for dependency tracing
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Keyboard shortcut listener (Delete / Backspace)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        (selectedNodeId || selectedEdgeId) &&
        !(e.target as HTMLElement).matches('input, textarea')
      ) {
        onDeleteSelected();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectedEdgeId, onDeleteSelected]);

  // Global mouse up to avoid stuck dragging when cursor leaves canvas
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsPanning(false);
      setDraggingNodeId(null);
      setConnectingFrom(null);
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Compute dependency highlights if active
  const activeFocusNodeId = hoveredNodeId || selectedNodeId;
  const highlightedDependencies = useMemo(() => {
    if (!traceDependencies || !activeFocusNodeId) {
      return { nodeIds: new Set<string>(), edgeIds: new Set<string>() };
    }

    const nodeIds = new Set<string>([activeFocusNodeId]);
    const edgeIds = new Set<string>();

    // Forward traverse (downstream)
    const traverseDownstream = (currId: string) => {
      diagram.edges.forEach(e => {
        if (e.fromNodeId === currId && !nodeIds.has(e.toNodeId)) {
          nodeIds.add(e.toNodeId);
          edgeIds.add(e.id);
          traverseDownstream(e.toNodeId);
        } else if (e.fromNodeId === currId) {
          edgeIds.add(e.id);
        }
      });
    };

    // Upstream traverse (dependencies that feed into this node)
    const traverseUpstream = (currId: string) => {
      diagram.edges.forEach(e => {
        if (e.toNodeId === currId && !nodeIds.has(e.fromNodeId)) {
          nodeIds.add(e.fromNodeId);
          edgeIds.add(e.id);
          traverseUpstream(e.fromNodeId);
        } else if (e.toNodeId === currId) {
          edgeIds.add(e.id);
        }
      });
    };

    traverseDownstream(activeFocusNodeId);
    traverseUpstream(activeFocusNodeId);

    return { nodeIds, edgeIds };
  }, [traceDependencies, activeFocusNodeId, diagram.edges]);

  // Helper to get port coordinate in canvas space
  const getPortCoordinate = useCallback(
    (node: DiagramNode, port: PortPosition = 'right') => {
      const w = node.width || 180;
      const h = node.height || 100;
      const { x, y } = node.position;

      switch (port) {
        case 'top':
          return { x: x + w / 2, y };
        case 'right':
          return { x: x + w, y: y + h / 2 };
        case 'bottom':
          return { x: x + w / 2, y: y + h };
        case 'left':
          return { x, y: y + h / 2 };
      }
    },
    []
  );

  // Wheel zoom handler
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.08 : 0.92;
    const newZoom = Math.min(Math.max(zoom * zoomFactor, 0.25), 2.5);

    // Zoom towards mouse
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const newPanX = mouseX - (mouseX - pan.x) * (newZoom / zoom);
      const newPanY = mouseY - (mouseY - pan.y) * (newZoom / zoom);

      setZoom(newZoom);
      setPan({ x: newPanX, y: newPanY });
    } else {
      setZoom(newZoom);
    }
  };

  // Canvas Mouse Down
  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.target !== containerRef.current && (e.target as HTMLElement).tagName !== 'svg') {
      return;
    }
    // Deselect
    onSelectNode(null);
    onSelectEdge(null);

    // Start panning
    setIsPanning(true);
    setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  // Global Canvas Mouse Move
  const handleCanvasMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const rawX = (e.clientX - rect.left - pan.x) / zoom;
    const rawY = (e.clientY - rect.top - pan.y) / zoom;
    setMousePos({ x: rawX, y: rawY });

    if (isPanning) {
      setPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (draggingNodeId) {
      const updated = diagram.nodes.map(n => {
        if (n.id === draggingNodeId) {
          return {
            ...n,
            position: {
              x: Math.round(rawX - dragOffset.x),
              y: Math.round(rawY - dragOffset.y),
            },
          };
        }
        return n;
      });
      onUpdateNodes(updated);
    }
  };

  // Canvas Mouse Up
  const handleCanvasMouseUp = () => {
    setIsPanning(false);
    setDraggingNodeId(null);
    setConnectingFrom(null);
  };

  // Start Node Drag
  const handleNodeMouseDown = (e: React.MouseEvent, node: DiagramNode) => {
    if (toolMode === 'pan') return;
    e.stopPropagation();
    onSelectNode(node.id);
    onSelectEdge(null);

    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const canvasX = (e.clientX - rect.left - pan.x) / zoom;
    const canvasY = (e.clientY - rect.top - pan.y) / zoom;

    setDraggingNodeId(node.id);
    setDragOffset({
      x: canvasX - node.position.x,
      y: canvasY - node.position.y,
    });
  };

  // Start Port Connection
  const handlePortMouseDown = (
    e: React.MouseEvent,
    node: DiagramNode,
    port: PortPosition
  ) => {
    e.stopPropagation();
    const coord = getPortCoordinate(node, port);
    setConnectingFrom({
      nodeId: node.id,
      port,
      startPos: coord,
    });
  };

  // Release on Port to finish connection
  const handlePortMouseUp = (
    e: React.MouseEvent,
    targetNode: DiagramNode,
    targetPort: PortPosition
  ) => {
    e.stopPropagation();
    if (!connectingFrom || connectingFrom.nodeId === targetNode.id) {
      setConnectingFrom(null);
      return;
    }

    const newEdge: DiagramEdge = {
      id: `edge-${Date.now()}`,
      fromNodeId: connectingFrom.nodeId,
      fromPort: connectingFrom.port,
      toNodeId: targetNode.id,
      toPort: targetPort,
      style: 'curved',
      animated: true,
      color: '#6366f1',
    };

    onAddEdge(newEdge);
    setConnectingFrom(null);
  };

  // Generate SVG Path for Edges
  const calculatePath = (
    fromPos: { x: number; y: number },
    toPos: { x: number; y: number },
    style: 'curved' | 'orthogonal' | 'straight' = 'curved',
    fromPort: PortPosition = 'right',
    toPort: PortPosition = 'left'
  ) => {
    if (style === 'straight') {
      return `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`;
    }

    if (style === 'orthogonal') {
      const midX = (fromPos.x + toPos.x) / 2;
      return `M ${fromPos.x} ${fromPos.y} L ${midX} ${fromPos.y} L ${midX} ${toPos.y} L ${toPos.x} ${toPos.y}`;
    }

    // Default: smooth bezier curve with directional offsets
    let dx = Math.abs(toPos.x - fromPos.x) * 0.55;
    let dy = Math.abs(toPos.y - fromPos.y) * 0.55;
    dx = Math.max(dx, 40);
    dy = Math.max(dy, 40);

    let c1x = fromPos.x;
    let c1y = fromPos.y;
    let c2x = toPos.x;
    let c2y = toPos.y;

    if (fromPort === 'right') c1x += dx;
    if (fromPort === 'left') c1x -= dx;
    if (fromPort === 'top') c1y -= dy;
    if (fromPort === 'bottom') c1y += dy;

    if (toPort === 'right') c2x += dx;
    if (toPort === 'left') c2x -= dx;
    if (toPort === 'top') c2y -= dy;
    if (toPort === 'bottom') c2y += dy;

    return `M ${fromPos.x} ${fromPos.y} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${toPos.x} ${toPos.y}`;
  };

  // Fit View
  const handleFitView = () => {
    if (!diagram.nodes.length || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();

    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;

    diagram.nodes.forEach(n => {
      minX = Math.min(minX, n.position.x);
      minY = Math.min(minY, n.position.y);
      maxX = Math.max(maxX, n.position.x + (n.width || 180));
      maxY = Math.max(maxY, n.position.y + (n.height || 100));
    });

    const padding = 80;
    const diagramW = maxX - minX + padding * 2;
    const diagramH = maxY - minY + padding * 2;

    const scaleX = rect.width / diagramW;
    const scaleY = rect.height / diagramH;
    const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.3), 1.2);

    setZoom(newZoom);
    setPan({
      x: rect.width / 2 - ((minX + maxX) / 2) * newZoom,
      y: rect.height / 2 - ((minY + maxY) / 2) * newZoom,
    });
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        background: '#0d1117',
        cursor:
          toolMode === 'pan' || isPanning
            ? isPanning
              ? 'grabbing'
              : 'grab'
            : 'default',
        userSelect: 'none',
      }}
      onWheel={handleWheel}
      onMouseDown={handleCanvasMouseDown}
      onMouseMove={handleCanvasMouseMove}
      onMouseUp={handleCanvasMouseUp}
    >
      {/* Dynamic Grid Background */}
      {showGrid && (
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <pattern
              id="grid-dots"
              width={24 * zoom}
              height={24 * zoom}
              patternUnits="userSpaceOnUse"
              patternTransform={`translate(${pan.x}, ${pan.y})`}
            >
              <circle cx="2" cy="2" r="1.2" fill="#21262d" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-dots)" />
        </svg>
      )}

      {/* Transformable Canvas Content */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transformOrigin: '0 0',
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          width: 0,
          height: 0,
        }}
      >
        {/* Render Background Groups */}
        {diagram.groups?.map(group => (
          <div
            key={group.id}
            style={{
              position: 'absolute',
              left: group.bounds.x,
              top: group.bounds.y,
              width: group.bounds.width,
              height: group.bounds.height,
              border: `2px dashed ${group.color || '#30363d'}`,
              borderRadius: '16px',
              backgroundColor: 'rgba(22, 27, 34, 0.45)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-12px',
                left: '16px',
                background: '#161b22',
                padding: '2px 10px',
                borderRadius: '8px',
                fontSize: '11px',
                fontWeight: 600,
                color: group.color || '#8b949e',
                border: `1px solid ${group.color || '#30363d'}`,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              {group.label}
            </div>
          </div>
        ))}

        {/* SVG Edges Layer */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '10000px',
            height: '10000px',
            pointerEvents: 'none',
            zIndex: 2,
            overflow: 'visible',
          }}
        >
          <defs>
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#6366f1" />
            </marker>
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
            </marker>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Render Existing Edges */}
          {diagram.edges.map(edge => {
            const fromNode = diagram.nodes.find(n => n.id === edge.fromNodeId);
            const toNode = diagram.nodes.find(n => n.id === edge.toNodeId);
            if (!fromNode || !toNode) return null;

            const fromCoord = getPortCoordinate(fromNode, edge.fromPort || 'right');
            const toCoord = getPortCoordinate(toNode, edge.toPort || 'left');

            const isSelected = selectedEdgeId === edge.id;
            const isTraceHighlighted =
              traceDependencies &&
              highlightedDependencies.edgeIds.has(edge.id);
            const isDimmed =
              traceDependencies &&
              activeFocusNodeId &&
              !isTraceHighlighted;

            const pathD = calculatePath(
              fromCoord,
              toCoord,
              edge.style || 'curved',
              edge.fromPort || 'right',
              edge.toPort || 'left'
            );

            const midX = (fromCoord.x + toCoord.x) / 2;
            const midY = (fromCoord.y + toCoord.y) / 2;

            return (
              <g
                key={edge.id}
                style={{
                  pointerEvents: 'stroke',
                  cursor: 'pointer',
                  opacity: isDimmed ? 0.2 : 1,
                  transition: 'opacity 0.2s ease',
                }}
                onClick={e => {
                  e.stopPropagation();
                  onSelectEdge(edge.id);
                  onSelectNode(null);
                }}
              >
                {/* Invisible wide hit area for easy clicking */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                />

                {/* Main Cable Stroke */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={
                    isSelected
                      ? '#38bdf8'
                      : isTraceHighlighted
                        ? '#ec4899'
                        : edge.color || '#6366f1'
                  }
                  strokeWidth={isSelected || isTraceHighlighted ? 3 : 2}
                  strokeDasharray={edge.animated || edge.dashed ? '6,6' : undefined}
                  markerEnd="url(#arrow-default)"
                  filter={isTraceHighlighted ? 'url(#glow)' : undefined}
                >
                  {edge.animated && (
                    <animate
                      attributeName="stroke-dashoffset"
                      from="24"
                      to="0"
                      dur="1.2s"
                      repeatCount="indefinite"
                    />
                  )}
                </path>

                {/* Edge Protocol / Label Badge */}
                {(edge.label || edge.protocol) && (
                  <g transform={`translate(${midX}, ${midY})`}>
                    <rect
                      x="-42"
                      y="-12"
                      width="84"
                      height="22"
                      rx="6"
                      fill="#161b22"
                      stroke={isSelected ? '#38bdf8' : '#30363d'}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3"
                      textAnchor="middle"
                      fill="#e6edf3"
                      fontSize="10"
                      fontWeight="600"
                      fontFamily="monospace"
                      letterSpacing="0.02em"
                    >
                      {edge.label || edge.protocol}
                    </text>
                  </g>
                )}
              </g>
            );
          })}

          {/* Currently Drawing Edge */}
          {connectingFrom && (
            <path
              d={calculatePath(
                connectingFrom.startPos,
                mousePos,
                'curved',
                connectingFrom.port,
                'left'
              )}
              fill="none"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="4,4"
              markerEnd="url(#arrow-active)"
            />
          )}
        </svg>

        {/* Nodes Layer */}
        {diagram.nodes.map(node => {
          const isSelected = selectedNodeId === node.id;
          const isTraceHighlighted =
            traceDependencies &&
            highlightedDependencies.nodeIds.has(node.id);
          const isDimmed =
            traceDependencies &&
            activeFocusNodeId &&
            !isTraceHighlighted;

          const width = node.width || 190;
          const height = node.height || 105;

          return (
            <div
              key={node.id}
              style={{
                position: 'absolute',
                left: node.position.x,
                top: node.position.y,
                width,
                minHeight: height,
                zIndex: isSelected ? 10 : 3,
                opacity: isDimmed ? 0.25 : 1,
                transition: 'opacity 0.2s ease, box-shadow 0.2s ease',
              }}
              onMouseDown={e => handleNodeMouseDown(e, node)}
              onMouseEnter={() => setHoveredNodeId(node.id)}
              onMouseLeave={() => setHoveredNodeId(null)}
            >
              {/* Node Card Shell */}
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: node.bg || '#161b22',
                  border: `1.5px solid ${
                    isSelected
                      ? '#38bdf8'
                      : isTraceHighlighted
                        ? '#ec4899'
                        : node.color || '#30363d'
                  }`,
                  borderRadius:
                    node.shape === 'cylinder' || node.shape === 'database'
                      ? '10px'
                      : node.shape === 'diamond'
                        ? '4px'
                        : node.shape === 'hexagon'
                          ? '12px'
                          : '12px',
                  boxShadow: isSelected
                    ? '0 0 0 2px rgba(56, 189, 248, 0.3), 0 8px 24px rgba(0,0,0,0.5)'
                    : isTraceHighlighted
                      ? '0 0 16px rgba(236, 72, 153, 0.4)'
                      : '0 4px 12px rgba(0,0,0,0.3)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  cursor: toolMode === 'pan' ? 'inherit' : 'move',
                }}
              >
                {/* ERD Table Specific Rendering */}
                {node.columns && node.columns.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Header */}
                    <div
                      style={{
                        padding: '8px 12px',
                        background: '#1f2937',
                        borderBottom: '1px solid #374151',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '14px' }}>🗃️</span>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: '#f3f4f6' }}>
                          {node.label}
                        </span>
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                          fontFamily: 'monospace',
                        }}
                      >
                        TABLE
                      </span>
                    </div>

                    {/* Columns List */}
                    <div style={{ padding: '6px 8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {node.columns.map((col, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            fontSize: '11px',
                            fontFamily: 'monospace',
                            padding: '3px 6px',
                            borderRadius: '4px',
                            background: col.isPrimary
                              ? 'rgba(234, 179, 8, 0.1)'
                              : col.isForeign
                                ? 'rgba(59, 130, 246, 0.1)'
                                : 'transparent',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {col.isPrimary && (
                              <span title="Primary Key" style={{ color: '#eab308' }}>
                                🔑
                              </span>
                            )}
                            {col.isForeign && (
                              <span title="Foreign Key" style={{ color: '#3b82f6' }}>
                                🔗
                              </span>
                            )}
                            <span
                              style={{
                                color: col.isPrimary ? '#fbbf24' : '#e5e7eb',
                                fontWeight: col.isPrimary ? 600 : 400,
                              }}
                            >
                              {col.name}
                            </span>
                          </div>
                          <span style={{ color: '#9ca3af', fontSize: '10px' }}>
                            {col.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Standard Node Rendering (Architecture / Microservices / Cloud) */
                  <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {/* Top Row: Icon + Label + Badge */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '18px', lineHeight: 1 }}>
                          {node.icon || '⚡'}
                        </span>
                        <div>
                          <div
                            style={{
                              fontWeight: 700,
                              fontSize: '13px',
                              color: '#f0f6fc',
                              letterSpacing: '-0.01em',
                            }}
                          >
                            {node.label}
                          </div>
                          {node.tech && (
                            <div
                              style={{
                                fontSize: '10px',
                                color: node.color || '#58a6ff',
                                fontWeight: 600,
                                fontFamily: 'monospace',
                              }}
                            >
                              {node.tech}
                            </div>
                          )}
                        </div>
                      </div>

                      {node.badge && (
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 600,
                            padding: '2px 6px',
                            borderRadius: '10px',
                            background: 'rgba(255,255,255,0.08)',
                            color: '#8b949e',
                            border: '1px solid rgba(255,255,255,0.1)',
                          }}
                        >
                          {node.badge}
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {node.description && (
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#8b949e',
                          lineHeight: 1.4,
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {node.description}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 4 Connection Ports (Top, Right, Bottom, Left) */}
              {(['top', 'right', 'bottom', 'left'] as PortPosition[]).map(port => {
                const portPos = getPortCoordinate(
                  { ...node, position: { x: 0, y: 0 }, width, height },
                  port
                );

                return (
                  <div
                    key={port}
                    style={{
                      position: 'absolute',
                      left: portPos.x - 6,
                      top: portPos.y - 6,
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#161b22',
                      border: '2px solid #6366f1',
                      cursor: 'crosshair',
                      zIndex: 20,
                      opacity: isSelected || hoveredNodeId === node.id ? 1 : 0,
                      transform: 'scale(1)',
                      transition: 'opacity 0.15s ease, transform 0.15s ease',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.4)')}
                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                    onMouseDown={e => handlePortMouseDown(e, node, port)}
                    onMouseUp={e => handlePortMouseUp(e, node, port)}
                    title={`Connect ${port}`}
                  />
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Floating Canvas Quick Controls (Bottom Left) */}
      <div
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#161b22',
          padding: '6px 10px',
          borderRadius: '12px',
          border: '1px solid #30363d',
          boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
          zIndex: 30,
        }}
      >
        <button
          onClick={() => setZoom(z => Math.max(z - 0.15, 0.25))}
          title="Zoom Out"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#c9d1d9',
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: '14px',
            fontWeight: 700,
            borderRadius: '6px',
          }}
        >
          -
        </button>
        <span
          style={{
            fontSize: '11px',
            color: '#8b949e',
            minWidth: '42px',
            textAlign: 'center',
            fontFamily: 'monospace',
          }}
        >
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(z => Math.min(z + 0.15, 2.5))}
          title="Zoom In"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#c9d1d9',
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: '14px',
            fontWeight: 700,
            borderRadius: '6px',
          }}
        >
          +
        </button>
        <div style={{ width: '1px', height: '16px', background: '#30363d', margin: '0 4px' }} />
        <button
          onClick={handleFitView}
          title="Fit to Screen"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#c9d1d9',
            cursor: 'pointer',
            padding: '4px 8px',
            fontSize: '11px',
            fontWeight: 600,
            borderRadius: '6px',
          }}
        >
          Fit View
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setPan({ x: 120, y: 80 });
          }}
          title="Reset View"
          style={{
            background: 'transparent',
            border: 'none',
            color: '#8b949e',
            cursor: 'pointer',
            padding: '4px 6px',
            fontSize: '11px',
            borderRadius: '6px',
          }}
        >
          100%
        </button>
      </div>

      {/* Floating Minimap (Bottom Right) */}
      {showMinimap && diagram.nodes.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '24px',
            right: '24px',
            width: '160px',
            height: '110px',
            background: 'rgba(22, 27, 34, 0.85)',
            backdropFilter: 'blur(8px)',
            border: '1px solid #30363d',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            zIndex: 30,
          }}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '100%',
            }}
          >
            {/* Render Mini Nodes */}
            {diagram.nodes.map(n => {
              // Normalize positions to 0-160, 0-110 bounds
              const miniX = Math.min(Math.max((n.position.x / 1400) * 140 + 10, 5), 145);
              const miniY = Math.min(Math.max((n.position.y / 900) * 90 + 10, 5), 95);

              return (
                <div
                  key={n.id}
                  style={{
                    position: 'absolute',
                    left: miniX,
                    top: miniY,
                    width: '12px',
                    height: '8px',
                    borderRadius: '2px',
                    background: n.id === selectedNodeId ? '#38bdf8' : n.color || '#6366f1',
                    opacity: 0.8,
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

