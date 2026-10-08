import { Button, IconButton, Switch } from '@nexio/component';
import { notify } from '@nexio/component/ui/notification';
import { ArrowLeftBigIcon, CloseIcon, DeleteIcon, PlusIcon } from '@blocksuite/icons/rc';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { NODE_CATALOG } from './defaults';
import type { NodeCategory, NodeDefinition, WorkflowConnection, WorkflowItem, WorkflowNode } from './types';

interface WorkflowCanvasProps {
  workflow: WorkflowItem;
  onUpdateWorkflow: (updated: WorkflowItem) => void;
  onBack: () => void;
}

const CATEGORY_COLORS: Record<NodeCategory, { bg: string; text: string; border: string }> = {
  trigger: { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
  ai: { bg: 'rgba(236, 72, 153, 0.12)', text: '#ec4899', border: 'rgba(236, 72, 153, 0.3)' },
  logic: { bg: 'rgba(234, 179, 8, 0.12)', text: '#eab308', border: 'rgba(234, 179, 8, 0.3)' },
  action: { bg: 'rgba(16, 185, 129, 0.12)', text: '#10b981', border: 'rgba(16, 185, 129, 0.3)' },
};

export const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  workflow: initialWorkflow,
  onUpdateWorkflow,
  onBack,
}) => {
  const [workflow, setWorkflow] = useState<WorkflowItem>(initialWorkflow);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [logsOpen, setLogsOpen] = useState(false);
  const [executionLogs, setExecutionLogs] = useState<Array<{ timestamp: string; nodeName: string; status: string; data: any }>>([]);

  // Connecting handles state
  const [connectingFrom, setConnectingFrom] = useState<{ nodeId: string; port: string; x: number; y: number } | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Dragging node state
  const [draggingNode, setDraggingNode] = useState<{ id: string; startX: number; startY: number; nodeX: number; nodeY: number } | null>(null);

  const canvasRef = useRef<HTMLDivElement>(null);

  // Sync state upward when workflow changes
  const updateWorkflowState = useCallback(
    (updater: (prev: WorkflowItem) => WorkflowItem) => {
      setWorkflow(prev => {
        const next = updater(prev);
        onUpdateWorkflow(next);
        return next;
      });
    },
    [onUpdateWorkflow]
  );

  // Node Drag Handlers
  const handleNodeMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    if ((e.target as HTMLElement).closest('.port-handle')) return;
    e.stopPropagation();
    setSelectedNodeId(node.id);
    setDraggingNode({
      id: node.id,
      startX: e.clientX,
      startY: e.clientY,
      nodeX: node.position.x,
      nodeY: node.position.y,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const curX = e.clientX - rect.left;
    const curY = e.clientY - rect.top;
    setMousePos({ x: curX, y: curY });

    if (draggingNode) {
      const deltaX = e.clientX - draggingNode.startX;
      const deltaY = e.clientY - draggingNode.startY;
      const newX = Math.max(20, draggingNode.nodeX + deltaX);
      const newY = Math.max(20, draggingNode.nodeY + deltaY);

      updateWorkflowState(prev => ({
        ...prev,
        nodes: prev.nodes.map(n =>
          n.id === draggingNode.id ? { ...n, position: { x: newX, y: newY } } : n
        ),
      }));
    }
  };

  const handleMouseUp = () => {
    setDraggingNode(null);
    setConnectingFrom(null);
  };

  // Port connection handler
  const handleStartConnect = (e: React.MouseEvent, nodeId: string, port: string) => {
    e.stopPropagation();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const handleRect = (e.target as HTMLElement).getBoundingClientRect();
    setConnectingFrom({
      nodeId,
      port,
      x: handleRect.left + handleRect.width / 2 - rect.left,
      y: handleRect.top + handleRect.height / 2 - rect.top,
    });
  };

  const handleEndConnect = (e: React.MouseEvent, targetNodeId: string, targetPort: string) => {
    e.stopPropagation();
    if (!connectingFrom || connectingFrom.nodeId === targetNodeId) {
      setConnectingFrom(null);
      return;
    }

    // Add new connection if not duplicate
    const newConn: WorkflowConnection = {
      id: `conn-${Date.now()}`,
      fromNodeId: connectingFrom.nodeId,
      fromPort: connectingFrom.port,
      toNodeId: targetNodeId,
      toPort: targetPort,
    };

    updateWorkflowState(prev => {
      const exists = prev.connections.some(
        c => c.fromNodeId === newConn.fromNodeId && c.toNodeId === newConn.toNodeId
      );
      if (exists) return prev;
      return {
        ...prev,
        connections: [...prev.connections, newConn],
      };
    });

    setConnectingFrom(null);
  };

  // Delete Connection
  const handleDeleteConnection = (connId: string) => {
    updateWorkflowState(prev => ({
      ...prev,
      connections: prev.connections.filter(c => c.id !== connId),
    }));
  };

  // Add node from palette
  const handleAddNode = (def: NodeDefinition) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: def.category,
      subType: def.subType,
      name: def.name,
      description: def.description,
      position: { x: 300 + Math.random() * 80, y: 150 + Math.random() * 80 },
      status: 'idle',
      config: { ...def.defaultConfig },
    };

    updateWorkflowState(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode],
    }));

    setSelectedNodeId(newNode.id);
    setPaletteOpen(false);
    notify.success({
      title: 'Node Added',
      message: `Added ${def.name} to the workflow canvas.`,
    });
  };

  // Delete Node
  const handleDeleteNode = (nodeId: string) => {
    updateWorkflowState(prev => ({
      ...prev,
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      connections: prev.connections.filter(c => c.fromNodeId !== nodeId && c.toNodeId !== nodeId),
    }));
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
  };

  // Execution engine simulation with live logs
  const handleExecute = async () => {
    if (isExecuting) return;
    setIsExecuting(true);
    setLogsOpen(true);
    setExecutionLogs([]);

    // Reset node statuses
    updateWorkflowState(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => ({ ...n, status: 'idle', outputData: undefined, error: undefined })),
    }));

    // Find trigger node or first node
    const triggerNodes = workflow.nodes.filter(n => n.type === 'trigger');
    const startNodes = triggerNodes.length > 0 ? triggerNodes : [workflow.nodes[0]];

    const addLog = (nodeName: string, status: string, data: any) => {
      setExecutionLogs(logs => [
        ...logs,
        {
          timestamp: new Date().toLocaleTimeString(),
          nodeName,
          status,
          data,
        },
      ]);
    };

    let executionPayload: any = {
      triggeredAt: new Date().toISOString(),
      workspace: 'current',
      items: [{ id: 'item-1', content: 'Sample document payload for automation' }],
    };

    for (const node of startNodes) {
      if (!node) continue;

      // Set node to running
      updateWorkflowState(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => (n.id === node.id ? { ...n, status: 'running' } : n)),
      }));

      await new Promise(r => setTimeout(r, 600));

      const nodeOutput = {
        node: node.name,
        type: node.subType,
        output: node.type === 'ai' ? 'AI Generated structured executive summary & insights' : 'Processed payload successfully',
        timestamp: Date.now(),
      };
      executionPayload = { ...executionPayload, ...nodeOutput };

      updateWorkflowState(prev => ({
        ...prev,
        nodes: prev.nodes.map(n => (n.id === node.id ? { ...n, status: 'success', outputData: nodeOutput } : n)),
      }));

      addLog(node.name, 'Success', nodeOutput);

      // Follow downstream connections
      const nextConns = workflow.connections.filter(c => c.fromNodeId === node.id);
      for (const conn of nextConns) {
        const nextNode = workflow.nodes.find(n => n.id === conn.toNodeId);
        if (!nextNode) continue;

        updateWorkflowState(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => (n.id === nextNode.id ? { ...n, status: 'running' } : n)),
        }));

        await new Promise(r => setTimeout(r, 800));

        const nextOutput = {
          node: nextNode.name,
          status: 'success',
          result: `Executed action ${nextNode.name} with model response.`,
          data: executionPayload,
        };

        updateWorkflowState(prev => ({
          ...prev,
          nodes: prev.nodes.map(n => (n.id === nextNode.id ? { ...n, status: 'success', outputData: nextOutput } : n)),
        }));

        addLog(nextNode.name, 'Success', nextOutput);
      }
    }

    setIsExecuting(false);
    updateWorkflowState(prev => ({
      ...prev,
      lastRunAt: Date.now(),
      lastRunStatus: 'success',
      executionCount: (prev.executionCount || 0) + 1,
    }));

    notify.success({
      title: 'Workflow Execution Finished',
      message: 'All automation nodes executed successfully with zero errors.',
    });
  };

  const selectedNode = workflow.nodes.find(n => n.id === selectedNodeId);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        position: 'relative',
        backgroundColor: 'var(--affine-background-primary-color)',
        color: 'var(--affine-text-primary-color)',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes pulseFlow {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
      `}</style>
      {/* Top Builder Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 20px',
          borderBottom: '1px solid var(--affine-border-color)',
          backgroundColor: 'var(--affine-background-primary-color)',
          zIndex: 10,
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <IconButton size="small" onClick={onBack} tooltip="Back to All Workflows">
            <ArrowLeftBigIcon />
          </IconButton>
          <div>
            <input
              type="text"
              value={workflow.name}
              onChange={e => {
                const newName = e.target.value;
                updateWorkflowState(prev => ({ ...prev, name: newName }));
              }}
              style={{
                fontSize: '16px',
                fontWeight: 600,
                border: 'none',
                background: 'transparent',
                color: 'var(--affine-text-primary-color)',
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '11px', color: 'var(--affine-text-secondary-color)' }}>
              {workflow.nodes.length} nodes · {workflow.connections.length} connections
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginRight: '8px' }}>
            <span style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)' }}>Active</span>
            <Switch
              checked={workflow.active}
              onChange={checked => {
                updateWorkflowState(prev => ({ ...prev, active: checked }));
                notify.info({
                  title: checked ? 'Workflow Activated' : 'Workflow Deactivated',
                  message: checked ? 'Automation is now actively listening for triggers.' : 'Automation stopped.',
                });
              }}
            />
          </div>

          <Button variant="secondary" onClick={() => setPaletteOpen(true)} prefix={<PlusIcon />}>
            Add Node
          </Button>

          <Button
            variant="primary"
            onClick={handleExecute}
            loading={isExecuting}
            disabled={isExecuting || workflow.nodes.length === 0}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            }}
          >
            {isExecuting ? 'Running...' : 'Execute Workflow'}
          </Button>

          <Button
            variant="secondary"
            onClick={() => setLogsOpen(prev => !prev)}
            style={{ color: logsOpen ? '#3b82f6' : undefined }}
          >
            Logs {executionLogs.length > 0 && `(${executionLogs.length})`}
          </Button>
        </div>
      </div>

      {/* Main Canvas Workspace */}
      <div
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: 'var(--affine-background-secondary-color)',
          backgroundImage:
            'radial-gradient(var(--affine-border-color, rgba(0, 0, 0, 0.15)) 1px, transparent 1px)',
          backgroundSize: '24px 24px',
          cursor: draggingNode ? 'grabbing' : 'default',
        }}
      >
        {/* SVG Bezier Connection Cables */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 1,
          }}
        >
          <defs>
            <linearGradient id="activeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>

          {/* Existing connections */}
          {workflow.connections.map(conn => {
            const fromNode = workflow.nodes.find(n => n.id === conn.fromNodeId);
            const toNode = workflow.nodes.find(n => n.id === conn.toNodeId);
            if (!fromNode || !toNode) return null;

            // Output port is at right edge of fromNode (width: 220px, height: ~80px)
            const x1 = fromNode.position.x + 220;
            const y1 = fromNode.position.y + 44;
            // Input port is at left edge of toNode
            const x2 = toNode.position.x;
            const y2 = toNode.position.y + 44;

            const dx = Math.max(Math.abs(x2 - x1) / 2, 40);
            const pathD = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;

            const isFlowing = isExecuting && (fromNode.status === 'success' || fromNode.status === 'running');

            return (
              <g key={conn.id} style={{ pointerEvents: 'auto', cursor: 'pointer' }}>
                {/* Fat transparent hit-test line */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="16"
                  onClick={() => handleDeleteConnection(conn.id)}
                />
                {/* Visible bezier cable */}
                <path
                  d={pathD}
                  fill="none"
                  stroke={isFlowing ? 'url(#activeGradient)' : 'var(--affine-border-color, #94a3b8)'}
                  strokeWidth={isFlowing ? '3' : '2'}
                  strokeDasharray={isFlowing ? '6,6' : 'none'}
                  style={{
                    animation: isFlowing ? 'pulseFlow 1s linear infinite' : 'none',
                    transition: 'stroke 0.3s ease',
                  }}
                />
              </g>
            );
          })}

          {/* Pending connection being dragged */}
          {connectingFrom && (
            <path
              d={`M ${connectingFrom.x} ${connectingFrom.y} C ${connectingFrom.x + 60} ${connectingFrom.y}, ${
                mousePos.x - 60
              } ${mousePos.y}, ${mousePos.x} ${mousePos.y}`}
              fill="none"
              stroke="#3b82f6"
              strokeWidth="2.5"
              strokeDasharray="4,4"
            />
          )}
        </svg>

        {/* Nodes Render */}
        {workflow.nodes.map(node => {
          const isSelected = selectedNodeId === node.id;
          const colors = CATEGORY_COLORS[node.type] || CATEGORY_COLORS.action;
          const isRunning = node.status === 'running';
          const isSuccess = node.status === 'success';

          return (
            <div
              key={node.id}
              onMouseDown={e => handleNodeMouseDown(e, node)}
              style={{
                position: 'absolute',
                left: `${node.position.x}px`,
                top: `${node.position.y}px`,
                width: '220px',
                backgroundColor: 'var(--affine-background-primary-color)',
                borderRadius: '12px',
                border: isSelected
                  ? '2px solid #3b82f6'
                  : isRunning
                    ? '2px solid #ec4899'
                    : isSuccess
                      ? '2px solid #10b981'
                      : '1px solid var(--affine-border-color)',
                boxShadow: isSelected
                  ? '0 8px 24px rgba(59, 130, 246, 0.25)'
                  : '0 4px 14px rgba(0, 0, 0, 0.08)',
                zIndex: isSelected ? 5 : 2,
                cursor: 'grab',
                transition: 'border 0.2s, box-shadow 0.2s',
              }}
            >
              {/* Input Port (Left Handle) */}
              {node.type !== 'trigger' && (
                <div
                  className="port-handle"
                  onMouseUp={e => handleEndConnect(e, node.id, 'input')}
                  title="Connect Input"
                  style={{
                    position: 'absolute',
                    left: '-7px',
                    top: '38px',
                    width: '14px',
                    height: '14px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    border: '3px solid #3b82f6',
                    cursor: 'crosshair',
                    boxShadow: '0 0 6px rgba(59, 130, 246, 0.5)',
                  }}
                />
              )}

              {/* Node Card Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 12px 6px',
                  borderBottom: '1px solid var(--affine-border-color)',
                }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`,
                    fontSize: '14px',
                  }}
                >
                  {node.type === 'trigger' ? '⚡' : node.type === 'ai' ? '🧠' : node.type === 'logic' ? '🔀' : '📝'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {node.name}
                  </div>
                  <div
                    style={{
                      fontSize: '10px',
                      color: colors.text,
                      textTransform: 'uppercase',
                      fontWeight: 600,
                      letterSpacing: '0.4px',
                    }}
                  >
                    {node.type}
                  </div>
                </div>

                {/* Status Indicator */}
                {isRunning && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#ec4899',
                      boxShadow: '0 0 8px #ec4899',
                    }}
                  />
                )}
                {isSuccess && (
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#10b981',
                      boxShadow: '0 0 8px #10b981',
                    }}
                  />
                )}
              </div>

              {/* Node Card Body */}
              <div style={{ padding: '8px 12px 10px', fontSize: '11px', color: 'var(--affine-text-secondary-color)' }}>
                {node.description}
              </div>

              {/* Output Port (Right Handle) */}
              <div
                className="port-handle"
                onMouseDown={e => handleStartConnect(e, node.id, 'output')}
                title="Connect Output"
                style={{
                  position: 'absolute',
                  right: '-7px',
                  top: '38px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#fff',
                  border: '3px solid #ec4899',
                  cursor: 'crosshair',
                  boxShadow: '0 0 6px rgba(236, 72, 153, 0.5)',
                }}
              />
            </div>
          );
        })}

        {/* Node Configuration Drawer (Right Side) */}
        {selectedNode && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '320px',
              height: '100%',
              backgroundColor: 'var(--affine-background-primary-color)',
              borderLeft: '1px solid var(--affine-border-color)',
              boxShadow: '-4px 0 20px rgba(0, 0, 0, 0.1)',
              zIndex: 20,
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px',
                borderBottom: '1px solid var(--affine-border-color)',
              }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Node Settings</div>
                <div style={{ fontSize: '11px', color: 'var(--affine-text-secondary-color)' }}>
                  {selectedNode.name}
                </div>
              </div>
              <IconButton size="small" onClick={() => setSelectedNodeId(null)}>
                <CloseIcon />
              </IconButton>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                  Node Name
                </label>
                <input
                  type="text"
                  value={selectedNode.name}
                  onChange={e => {
                    const name = e.target.value;
                    updateWorkflowState(prev => ({
                      ...prev,
                      nodes: prev.nodes.map(n => (n.id === selectedNode.id ? { ...n, name } : n)),
                    }));
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--affine-border-color)',
                    backgroundColor: 'var(--affine-background-secondary-color)',
                    color: 'var(--affine-text-primary-color)',
                    fontSize: '12px',
                    outline: 'none',
                  }}
                />
              </div>

              {/* Dynamic Settings Fields based on node type */}
              {selectedNode.type === 'ai' && (
                <>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      AI Model
                    </label>
                    <select
                      value={selectedNode.config.model || 'gpt-4o'}
                      onChange={e => {
                        const model = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n =>
                            n.id === selectedNode.id ? { ...n, config: { ...n.config, model } } : n
                          ),
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--affine-border-color)',
                        backgroundColor: 'var(--affine-background-secondary-color)',
                        color: 'var(--affine-text-primary-color)',
                        fontSize: '12px',
                      }}
                    >
                      <option value="gpt-4o">OpenAI GPT-4o</option>
                      <option value="gpt-4o-mini">OpenAI GPT-4o Mini</option>
                      <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                      <option value="nexio-copilot">Nexio Native Copilot</option>
                      <option value="flux-schnell">Fal AI Flux Schnell (Image)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      System Instructions
                    </label>
                    <textarea
                      rows={3}
                      value={selectedNode.config.systemPrompt || ''}
                      onChange={e => {
                        const systemPrompt = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n =>
                            n.id === selectedNode.id ? { ...n, config: { ...n.config, systemPrompt } } : n
                          ),
                        }));
                      }}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--affine-border-color)',
                        backgroundColor: 'var(--affine-background-secondary-color)',
                        color: 'var(--affine-text-primary-color)',
                        fontSize: '12px',
                        fontFamily: 'inherit',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                      Prompt Template
                    </label>
                    <textarea
                      rows={3}
                      value={selectedNode.config.prompt || ''}
                      onChange={e => {
                        const prompt = e.target.value;
                        updateWorkflowState(prev => ({
                          ...prev,
                          nodes: prev.nodes.map(n =>
                            n.id === selectedNode.id ? { ...n, config: { ...n.config, prompt } } : n
                          ),
                        }));
                      }}
                      placeholder="{{$json.input}}"
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--affine-border-color)',
                        backgroundColor: 'var(--affine-background-secondary-color)',
                        color: 'var(--affine-text-primary-color)',
                        fontSize: '12px',
                        fontFamily: 'monospace',
                      }}
                    />
                  </div>
                </>
              )}

              {selectedNode.type === 'trigger' && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                    Trigger URL / Path
                  </label>
                  <input
                    type="text"
                    value={selectedNode.config.path || '/api/workflow/webhook-1'}
                    onChange={e => {
                      const path = e.target.value;
                      updateWorkflowState(prev => ({
                        ...prev,
                        nodes: prev.nodes.map(n =>
                          n.id === selectedNode.id ? { ...n, config: { ...n.config, path } } : n
                        ),
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--affine-border-color)',
                      backgroundColor: 'var(--affine-background-secondary-color)',
                      color: 'var(--affine-text-primary-color)',
                      fontSize: '12px',
                    }}
                  />
                </div>
              )}

              {selectedNode.type === 'action' && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--affine-text-secondary-color)', display: 'block', marginBottom: '6px' }}>
                    Target / URL
                  </label>
                  <input
                    type="text"
                    value={selectedNode.config.url || selectedNode.config.docTitle || ''}
                    onChange={e => {
                      const val = e.target.value;
                      updateWorkflowState(prev => ({
                        ...prev,
                        nodes: prev.nodes.map(n =>
                          n.id === selectedNode.id ? { ...n, config: { ...n.config, docTitle: val, url: val } } : n
                        ),
                      }));
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--affine-border-color)',
                      backgroundColor: 'var(--affine-background-secondary-color)',
                      color: 'var(--affine-text-primary-color)',
                      fontSize: '12px',
                    }}
                  />
                </div>
              )}

              {/* Node Output Preview if available */}
              {selectedNode.outputData && (
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#10b981', display: 'block', marginBottom: '6px' }}>
                    ✓ Output Payload
                  </label>
                  <pre
                    style={{
                      padding: '8px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--affine-background-secondary-color)',
                      fontSize: '10px',
                      maxHeight: '140px',
                      overflowY: 'auto',
                      border: '1px solid var(--affine-border-color)',
                    }}
                  >
                    {JSON.stringify(selectedNode.outputData, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid var(--affine-border-color)' }}>
              <Button
                variant="error"
                block
                prefix={<DeleteIcon />}
                onClick={() => handleDeleteNode(selectedNode.id)}
              >
                Delete Node
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Node Palette Modal */}
      {paletteOpen && (
        <div
          onClick={() => setPaletteOpen(false)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '640px',
              maxHeight: '80vh',
              backgroundColor: 'var(--affine-background-primary-color)',
              borderRadius: '16px',
              border: '1px solid var(--affine-border-color)',
              boxShadow: '0 16px 40px rgba(0, 0, 0, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                borderBottom: '1px solid var(--affine-border-color)',
              }}
            >
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>Automation Nodes Catalog</div>
                <div style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)' }}>
                  Select an AI model, trigger, or action to insert into your workflow
                </div>
              </div>
              <IconButton size="small" onClick={() => setPaletteOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
              {NODE_CATALOG.map(def => {
                const colors = CATEGORY_COLORS[def.category];
                return (
                  <div
                    key={def.subType}
                    onClick={() => handleAddNode(def)}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '10px',
                      border: '1px solid var(--affine-border-color)',
                      backgroundColor: 'var(--affine-background-secondary-color)',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, transform 0.15s',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = colors.text;
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'var(--affine-border-color)';
                      (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    }}
                  >
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: colors.bg,
                        border: `1px solid ${colors.border}`,
                        fontSize: '18px',
                        flexShrink: 0,
                      }}
                    >
                      {def.icon}
                    </div>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>{def.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--affine-text-secondary-color)', marginTop: '2px' }}>
                        {def.description}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Execution Logs Drawer (Bottom) */}
      {logsOpen && (
        <div
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '100%',
            height: '220px',
            backgroundColor: 'var(--affine-background-primary-color)',
            borderTop: '1px solid var(--affine-border-color)',
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.1)',
            zIndex: 15,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 16px',
              borderBottom: '1px solid var(--affine-border-color)',
              backgroundColor: 'var(--affine-background-secondary-color)',
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 600 }}>
              Live Execution Output Console {isExecuting && '(Running...)'}
            </div>
            <IconButton size="small" onClick={() => setLogsOpen(false)}>
              <CloseIcon />
            </IconButton>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px', fontFamily: 'monospace', fontSize: '11px' }}>
            {executionLogs.length === 0 ? (
              <div style={{ color: 'var(--affine-text-secondary-color)', textAlign: 'center', padding: '24px' }}>
                No executions recorded yet. Click &quot;Execute Workflow&quot; above to run your automation.
              </div>
            ) : (
              executionLogs.map((log, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '6px 0',
                    borderBottom: '1px solid var(--affine-border-color, rgba(0,0,0,0.05))',
                  }}
                >
                  <span style={{ color: 'var(--affine-text-secondary-color)' }}>[{log.timestamp}]</span>
                  <span style={{ fontWeight: 600, color: '#3b82f6' }}>{log.nodeName}</span>
                  <span style={{ color: '#10b981' }}>[{log.status}]</span>
                  <span style={{ color: 'var(--affine-text-primary-color)' }}>
                    {JSON.stringify(log.data)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
