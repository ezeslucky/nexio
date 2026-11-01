import {
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
  WorkbenchService,
} from '@nexio/core/modules/workbench';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { notify } from '@nexio/component';
import { useService } from '@toeverything/infra';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';

import type { DiagramEdge, DiagramItem, DiagramNode } from './types';
import { STARTER_DIAGRAMS } from './defaults';
import { autoLayoutDiagram } from './services/ai-diagram-service';

import { DiagramAiChat } from './components/diagram-ai-chat';
import { DiagramCanvas } from './components/diagram-canvas';
import { DiagramCodeEditor } from './components/diagram-code-editor';
import { DiagramDashboard } from './components/diagram-dashboard';
import { DiagramInspector } from './components/diagram-inspector';
import { DiagramShareModal } from './components/diagram-share-modal';
import { DiagramToolbar } from './components/diagram-toolbar';

export const Component = () => {
  const params = useParams<{ diagramId?: string }>();
  const workbench = useService(WorkbenchService).workbench;
  const workspaceService = useService(WorkspaceService);
  const currentWorkspaceId = workspaceService.workspace.id || 'default';

  const storageKey = `nexio:ai-diagrams:${currentWorkspaceId}`;

  // Diagrams State
  const [diagrams, setDiagrams] = useState<DiagramItem[]>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse diagrams from localStorage:', e);
    }
    return STARTER_DIAGRAMS;
  });

  // Current active diagram ID
  const activeDiagramId = params.diagramId || null;
  const activeDiagram = useMemo(
    () => diagrams.find(d => d.id === activeDiagramId) || null,
    [diagrams, activeDiagramId]
  );

  // Undo / Redo history
  const [history, setHistory] = useState<DiagramItem[]>([]);
  const [future, setFuture] = useState<DiagramItem[]>([]);

  // Editor Interaction State
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdgeId, setSelectedEdgeId] = useState<string | null>(null);
  const [toolMode, setToolMode] = useState<'select' | 'pan' | 'connect'>('select');
  const [showGrid, setShowGrid] = useState(true);
  const [showMinimap, setShowMinimap] = useState(true);
  const [showCodeView, setShowCodeView] = useState(false);
  const [traceDependencies, setTraceDependencies] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(diagrams));
    } catch (e) {
      console.error('Failed to save diagrams to localStorage:', e);
    }
  }, [diagrams, storageKey]);

  // Push to history
  const pushHistory = useCallback(
    (current: DiagramItem) => {
      setHistory(prev => [...prev.slice(-25), current]);
      setFuture([]);
    },
    []
  );

  // Update Active Diagram helper
  const updateActiveDiagram = useCallback(
    (updater: (prev: DiagramItem) => DiagramItem, recordHistory = true) => {
      if (!activeDiagram) return;
      if (recordHistory) {
        pushHistory(activeDiagram);
      }
      setDiagrams(prev =>
        prev.map(d => (d.id === activeDiagram.id ? updater(d) : d))
      );
    },
    [activeDiagram, pushHistory]
  );

  // Undo action
  const handleUndo = useCallback(() => {
    if (history.length === 0 || !activeDiagram) return;
    const previous = history[history.length - 1];
    setFuture(prev => [activeDiagram, ...prev]);
    setHistory(prev => prev.slice(0, -1));
    setDiagrams(prev =>
      prev.map(d => (d.id === activeDiagram.id ? previous : d))
    );
  }, [history, activeDiagram]);

  // Redo action
  const handleRedo = useCallback(() => {
    if (future.length === 0 || !activeDiagram) return;
    const next = future[0];
    setHistory(prev => [...prev, activeDiagram]);
    setFuture(prev => prev.slice(1));
    setDiagrams(prev =>
      prev.map(d => (d.id === activeDiagram.id ? next : d))
    );
  }, [future, activeDiagram]);

  // Auto Layout action
  const handleAutoLayout = useCallback(() => {
    if (!activeDiagram) return;
    const laidOut = autoLayoutDiagram(activeDiagram);
    updateActiveDiagram(() => laidOut);
    notify({
      title: 'Auto Layout Applied',
      message: 'Nodes arranged into neat architectural tiers.',
    });
  }, [activeDiagram, updateActiveDiagram]);

  // Add Node
  const handleAddNode = useCallback(
    (partial?: Partial<DiagramNode>) => {
      if (!activeDiagram) return;
      const count = activeDiagram.nodes.length + 1;
      const newNode: DiagramNode = {
        id: `node-${Date.now()}`,
        label: partial?.label || `Service ${count}`,
        shape: partial?.shape || 'rounded',
        icon: partial?.icon || '⚙️',
        tech: partial?.tech || 'Microservice',
        position: {
          x: 200 + (count % 4) * 140,
          y: 180 + Math.floor(count / 4) * 120,
        },
        width: 190,
        height: 105,
        color: '#6366f1',
        bg: '#161b22',
        columns: partial?.columns,
      };

      updateActiveDiagram(prev => ({
        ...prev,
        nodes: [...prev.nodes, newNode],
        updatedAt: Date.now(),
      }));
      setSelectedNodeId(newNode.id);
      setSelectedEdgeId(null);
    },
    [activeDiagram, updateActiveDiagram]
  );

  // Delete Selected Node or Edge
  const handleDeleteSelected = useCallback(() => {
    if (!activeDiagram) return;
    if (selectedNodeId) {
      updateActiveDiagram(prev => ({
        ...prev,
        nodes: prev.nodes.filter(n => n.id !== selectedNodeId),
        edges: prev.edges.filter(
          e => e.fromNodeId !== selectedNodeId && e.toNodeId !== selectedNodeId
        ),
        updatedAt: Date.now(),
      }));
      setSelectedNodeId(null);
    } else if (selectedEdgeId) {
      updateActiveDiagram(prev => ({
        ...prev,
        edges: prev.edges.filter(e => e.id !== selectedEdgeId),
        updatedAt: Date.now(),
      }));
      setSelectedEdgeId(null);
    }
  }, [activeDiagram, selectedNodeId, selectedEdgeId, updateActiveDiagram]);

  // Export functions (SVG, PNG, JSON)
  const handleExport = useCallback(
    (format: 'png' | 'svg' | 'json') => {
      if (!activeDiagram) return;

      if (format === 'json') {
        const dataStr =
          'data:text/json;charset=utf-8,' +
          encodeURIComponent(JSON.stringify(activeDiagram, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute('href', dataStr);
        downloadAnchor.setAttribute(
          'download',
          `${activeDiagram.title.toLowerCase().replace(/\s+/g, '-')}.diagram.json`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        notify({ title: 'JSON Exported', message: 'Diagram specification saved.' });
        return;
      }

      // Generate standalone SVG for both SVG & PNG exports
      let minX = Infinity;
      let minY = Infinity;
      let maxX = -Infinity;
      let maxY = -Infinity;

      activeDiagram.nodes.forEach(n => {
        minX = Math.min(minX, n.position.x);
        minY = Math.min(minY, n.position.y);
        maxX = Math.max(maxX, n.position.x + (n.width || 190));
        maxY = Math.max(maxY, n.position.y + (n.height || 105));
      });

      const padding = 60;
      const width = Math.max(maxX - minX + padding * 2, 800);
      const height = Math.max(maxY - minY + padding * 2, 600);
      const offsetX = -minX + padding;
      const offsetY = -minY + padding;

      let svgXml = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        <style>
          .bg { fill: #0d1117; }
          .node-card { fill: #161b22; stroke-width: 1.5; rx: 10px; }
          .node-title { fill: #f0f6fc; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 13px; font-weight: bold; }
          .node-tech { fill: #58a6ff; font-family: monospace; font-size: 10px; font-weight: 600; }
          .node-desc { fill: #8b949e; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; font-size: 11px; }
          .edge-cable { fill: none; stroke-width: 2.5; }
          .edge-pill { fill: #161b22; stroke: #30363d; stroke-width: 1; rx: 6px; }
          .edge-text { fill: #e6edf3; font-family: monospace; font-size: 10px; font-weight: 600; text-anchor: middle; }
        </style>
        <rect width="100%" height="100%" class="bg"/>
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#6366f1"/>
          </marker>
        </defs>
      `;

      // Draw Edges
      activeDiagram.edges.forEach(e => {
        const fromN = activeDiagram.nodes.find(n => n.id === e.fromNodeId);
        const toN = activeDiagram.nodes.find(n => n.id === e.toNodeId);
        if (!fromN || !toN) return;

        const x1 = fromN.position.x + (fromN.width || 190) + offsetX;
        const y1 = fromN.position.y + (fromN.height || 105) / 2 + offsetY;
        const x2 = toN.position.x + offsetX;
        const y2 = toN.position.y + (toN.height || 105) / 2 + offsetY;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;

        const d = `M ${x1} ${y1} C ${x1 + 60} ${y1}, ${x2 - 60} ${y2}, ${x2} ${y2}`;
        svgXml += `<path d="${d}" class="edge-cable" stroke="${e.color || '#6366f1'}" marker-end="url(#arrow)"/>`;

        if (e.label || e.protocol) {
          svgXml += `
            <g transform="translate(${midX}, ${midY})">
              <rect x="-40" y="-11" width="80" height="22" class="edge-pill"/>
              <text x="0" y="4" class="edge-text">${e.label || e.protocol}</text>
            </g>
          `;
        }
      });

      // Draw Nodes
      activeDiagram.nodes.forEach(n => {
        const nx = n.position.x + offsetX;
        const ny = n.position.y + offsetY;
        const nw = n.width || 190;
        const nh = n.height || 105;

        svgXml += `
          <g transform="translate(${nx}, ${ny})">
            <rect width="${nw}" height="${nh}" class="node-card" stroke="${n.color || '#30363d'}"/>
            <text x="14" y="28" class="node-title">${n.label}</text>
            <text x="14" y="44" class="node-tech">${n.tech || ''}</text>
            <text x="14" y="68" class="node-desc">${(n.description || '').slice(0, 32)}</text>
          </g>
        `;
      });

      svgXml += `</svg>`;

      if (format === 'svg') {
        const blob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${activeDiagram.title.toLowerCase().replace(/\s+/g, '-')}.svg`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        notify({ title: 'SVG Exported', message: 'High-res vector diagram saved.' });
      } else if (format === 'png') {
        const img = new Image();
        const svgBlob = new Blob([svgXml], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);

        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = width * 2; // 2x retina
          canvas.height = height * 2;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.scale(2, 2);
            ctx.drawImage(img, 0, 0);
            const pngUrl = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = pngUrl;
            a.download = `${activeDiagram.title.toLowerCase().replace(/\s+/g, '-')}.png`;
            document.body.appendChild(a);
            a.click();
            a.remove();
          }
          URL.revokeObjectURL(url);
          notify({ title: 'PNG Exported', message: 'Crystal-clear PNG saved.' });
        };
        img.src = url;
      }
    },
    [activeDiagram]
  );

  return (
    <>
      <ViewHeader>
        <ViewTitle>
          {activeDiagram
            ? `AI Diagram Studio / ${activeDiagram.title}`
            : 'AI Diagram Studio'}
        </ViewTitle>
        <ViewIcon>
          <span style={{ fontSize: '16px' }}>🏗️</span>
        </ViewIcon>
      </ViewHeader>

      <ViewBody>
        <div style={{ height: '100%', width: '100%', overflow: 'hidden' }}>
          {!activeDiagram ? (
            <DiagramDashboard
              diagrams={diagrams}
              onOpenDiagram={id => {
                workbench.open(`/ai-diagram/${id}`);
              }}
              onCreateNew={(type = 'system_architecture', initialData) => {
                const newDiagram: DiagramItem = {
                  id: `diagram-${Date.now()}`,
                  title: initialData?.title || 'Untitled Architecture',
                  description: initialData?.description || 'Custom technical diagram',
                  diagramType: type,
                  nodes: initialData?.nodes || [
                    {
                      id: 'node-client',
                      shape: 'actor',
                      label: 'Client User',
                      icon: '👤',
                      tech: 'Browser / Mobile',
                      position: { x: 100, y: 160 },
                      color: '#38bdf8',
                    },
                    {
                      id: 'node-service',
                      shape: 'rounded',
                      label: 'Backend Service',
                      icon: '⚙️',
                      tech: 'REST / GraphQL',
                      position: { x: 380, y: 160 },
                      color: '#6366f1',
                    },
                    {
                      id: 'node-db',
                      shape: 'database',
                      label: 'Primary Database',
                      icon: '🗄️',
                      tech: 'PostgreSQL',
                      position: { x: 660, y: 160 },
                      color: '#10b981',
                    },
                  ],
                  edges: initialData?.edges || [
                    {
                      id: 'edge-client-service',
                      fromNodeId: 'node-client',
                      toNodeId: 'node-service',
                      label: 'HTTPS / API',
                      style: 'curved',
                      animated: true,
                    },
                    {
                      id: 'edge-service-db',
                      fromNodeId: 'node-service',
                      toNodeId: 'node-db',
                      label: 'SQL Query',
                      style: 'curved',
                    },
                  ],
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                  version: 1,
                };
                setDiagrams(prev => [newDiagram, ...prev]);
                workbench.open(`/ai-diagram/${newDiagram.id}`);
              }}
              onDeleteDiagram={id => {
                setDiagrams(prev => prev.filter(d => d.id !== id));
                notify({ title: 'Diagram Deleted', message: 'Diagram permanently removed.' });
              }}
              onDuplicateDiagram={diagram => {
                const copy: DiagramItem = {
                  ...diagram,
                  id: `diagram-${Date.now()}`,
                  title: `${diagram.title} (Copy)`,
                  createdAt: Date.now(),
                  updatedAt: Date.now(),
                };
                setDiagrams(prev => [copy, ...prev]);
                notify({ title: 'Diagram Duplicated', message: `Created copy of ${diagram.title}.` });
              }}
            />
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height: '100%',
                background: '#0d1117',
                overflow: 'hidden',
              }}
            >
              {/* Top Toolbar */}
              <DiagramToolbar
                diagram={activeDiagram}
                toolMode={toolMode}
                onSetToolMode={setToolMode}
                showGrid={showGrid}
                onToggleGrid={() => setShowGrid(g => !g)}
                showMinimap={showMinimap}
                onToggleMinimap={() => setShowMinimap(m => !m)}
                showCodeView={showCodeView}
                onToggleCodeView={() => {
                  setShowCodeView(c => !c);
                  if (!showCodeView) setShowAiChat(false);
                }}
                traceDependencies={traceDependencies}
                onToggleTraceDependencies={() => setTraceDependencies(t => !t)}
                showAiChat={showAiChat}
                onToggleAiChat={() => {
                  setShowAiChat(a => !a);
                  if (!showAiChat) setShowCodeView(false);
                }}
                canUndo={history.length > 0}
                canRedo={future.length > 0}
                onUndo={handleUndo}
                onRedo={handleRedo}
                onAutoLayout={handleAutoLayout}
                onAddNode={handleAddNode}
                onRenameDiagram={newTitle => {
                  updateActiveDiagram(prev => ({
                    ...prev,
                    title: newTitle,
                    updatedAt: Date.now(),
                  }));
                }}
                onBackToDashboard={() => workbench.open('/ai-diagram')}
                onOpenShareModal={() => setShowShareModal(true)}
                onExport={handleExport}
              />

              {/* Main Studio Area */}
              <div style={{ display: 'flex', flex: 1, position: 'relative', overflow: 'hidden' }}>
                {/* Interactive Visual Canvas */}
                <div style={{ flex: 1, height: '100%', position: 'relative' }}>
                  <DiagramCanvas
                    diagram={activeDiagram}
                    selectedNodeId={selectedNodeId}
                    selectedEdgeId={selectedEdgeId}
                    onSelectNode={id => setSelectedNodeId(id)}
                    onSelectEdge={id => setSelectedEdgeId(id)}
                    onUpdateNodes={updatedNodes => {
                      updateActiveDiagram(
                        prev => ({
                          ...prev,
                          nodes: updatedNodes,
                          updatedAt: Date.now(),
                        }),
                        false // Don't record each micro-drag to history
                      );
                    }}
                    onAddEdge={newEdge => {
                      updateActiveDiagram(prev => ({
                        ...prev,
                        edges: [...prev.edges, newEdge],
                        updatedAt: Date.now(),
                      }));
                      setSelectedEdgeId(newEdge.id);
                    }}
                    onDeleteSelected={handleDeleteSelected}
                    toolMode={toolMode}
                    showGrid={showGrid}
                    showMinimap={showMinimap}
                    traceDependencies={traceDependencies}
                  />
                </div>

                {/* Right Side: Diagram as Code Panel */}
                {showCodeView && (
                  <DiagramCodeEditor
                    diagram={activeDiagram}
                    onApplyDiagram={updated => {
                      updateActiveDiagram(() => updated);
                      notify({ title: 'Code Synced', message: 'Diagram updated from code specification.' });
                    }}
                    onClose={() => setShowCodeView(false)}
                  />
                )}

                {/* Right Side: AI Assistant Chat Panel */}
                {showAiChat && (
                  <DiagramAiChat
                    diagram={activeDiagram}
                    onApplyDiagramChange={(updated, actionSummary) => {
                      updateActiveDiagram(() => updated);
                      notify({
                        title: 'AI Diagram Updated',
                        message: actionSummary,
                      });
                    }}
                    onClose={() => setShowAiChat(false)}
                  />
                )}

                {/* Right Side: Node / Edge Inspector (when AI chat & Code are closed, or docked) */}
                {!showCodeView && !showAiChat && (
                  <DiagramInspector
                    diagram={activeDiagram}
                    selectedNodeId={selectedNodeId}
                    selectedEdgeId={selectedEdgeId}
                    onUpdateNode={updatedNode => {
                      updateActiveDiagram(prev => ({
                        ...prev,
                        nodes: prev.nodes.map(n =>
                          n.id === updatedNode.id ? updatedNode : n
                        ),
                        updatedAt: Date.now(),
                      }));
                    }}
                    onUpdateEdge={updatedEdge => {
                      updateActiveDiagram(prev => ({
                        ...prev,
                        edges: prev.edges.map(e =>
                          e.id === updatedEdge.id ? updatedEdge : e
                        ),
                        updatedAt: Date.now(),
                      }));
                    }}
                    onUpdateDiagramMeta={updates => {
                      updateActiveDiagram(prev => ({
                        ...prev,
                        ...updates,
                        updatedAt: Date.now(),
                      }));
                    }}
                    onDeleteSelected={handleDeleteSelected}
                    onSelectNode={setSelectedNodeId}
                    onSelectEdge={setSelectedEdgeId}
                    onClose={() => {
                      setSelectedNodeId(null);
                      setSelectedEdgeId(null);
                    }}
                  />
                )}
              </div>

              {/* Share & Export Modal */}
              <DiagramShareModal
                diagram={activeDiagram}
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                onExport={handleExport}
              />
            </div>
          )}
        </div>
      </ViewBody>
    </>
  );
};

