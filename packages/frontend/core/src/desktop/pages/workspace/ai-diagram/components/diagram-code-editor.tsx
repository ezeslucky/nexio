import React, { useState, useEffect } from 'react';
import type { DiagramItem } from '../types';
import { convertMermaidToDiagram } from '../services/diagram-converter';

interface DiagramCodeEditorProps {
  diagram: DiagramItem;
  onApplyDiagram: (updated: DiagramItem) => void;
  onClose: () => void;
}

export const DiagramCodeEditor: React.FC<DiagramCodeEditorProps> = ({
  diagram,
  onApplyDiagram,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'mermaid' | 'json'>('mermaid');
  const [mermaidCode, setMermaidCode] = useState('');
  const [jsonCode, setJsonCode] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Generate Mermaid representation
  useEffect(() => {
    let code = 'flowchart TD\n';

    // Groups
    if (diagram.groups && diagram.groups.length > 0) {
      diagram.groups.forEach(g => {
        code += `  subgraph ${g.id}["${g.label}"]\n`;
        diagram.nodes
          .filter(n => n.groupId === g.id)
          .forEach(n => {
            code += `    ${n.id}["${n.label}"]\n`;
          });
        code += `  end\n`;
      });
    }

    // Ungrouped Nodes
    diagram.nodes
      .filter(n => !n.groupId)
      .forEach(n => {
        let nodeSyntax = `["${n.label}"]`;
        if (n.shape === 'cylinder' || n.shape === 'database') {
          nodeSyntax = `[("${n.label}")]`;
        } else if (n.shape === 'diamond') {
          nodeSyntax = `{"${n.label}"}`;
        } else if (n.shape === 'rounded') {
          nodeSyntax = `("${n.label}")`;
        }
        code += `  ${n.id}${nodeSyntax}\n`;
      });

    // Edges
    diagram.edges.forEach(e => {
      const labelPart = e.label || e.protocol ? `|"${e.label || e.protocol}"|` : '';
      code += `  ${e.fromNodeId} -->${labelPart} ${e.toNodeId}\n`;
    });

    setMermaidCode(code);
    setJsonCode(JSON.stringify(diagram, null, 2));
  }, [diagram]);

  const handleApplyMermaid = () => {
    try {
      setParseError(null);
      const converted = convertMermaidToDiagram(mermaidCode, diagram.title);
      onApplyDiagram({
        ...diagram,
        nodes: converted.nodes,
        edges: converted.edges,
        updatedAt: Date.now(),
      });
    } catch (err: any) {
      setParseError(`Failed to parse Mermaid code: ${err.message || 'Syntax error'}`);
    }
  };

  const handleApplyJson = () => {
    try {
      setParseError(null);
      const parsed = JSON.parse(jsonCode);
      if (!Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) {
        throw new Error('Invalid diagram JSON structure: must contain nodes and edges arrays.');
      }
      onApplyDiagram({
        ...diagram,
        ...parsed,
        updatedAt: Date.now(),
      });
    } catch (err: any) {
      setParseError(`JSON parse error: ${err.message}`);
    }
  };

  const handleCopy = () => {
    const text = activeTab === 'mermaid' ? mermaidCode : jsonCode;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        width: '420px',
        height: '100%',
        background: '#161b22',
        borderLeft: '1px solid #30363d',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 35,
        boxShadow: '-4px 0 24px rgba(0,0,0,0.4)',
      }}
    >
      {/* Top Bar */}
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #30363d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px' }}>&lt;/&gt;</span>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#f0f6fc' }}>
            Diagram as Code
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

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 16px',
          borderBottom: '1px solid #21262d',
          background: '#0d1117',
        }}
      >
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('mermaid')}
            style={{
              background: activeTab === 'mermaid' ? '#21262d' : 'transparent',
              border: `1px solid ${activeTab === 'mermaid' ? '#38bdf8' : 'transparent'}`,
              borderRadius: '6px',
              padding: '4px 10px',
              color: activeTab === 'mermaid' ? '#38bdf8' : '#8b949e',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Mermaid
          </button>
          <button
            onClick={() => setActiveTab('json')}
            style={{
              background: activeTab === 'json' ? '#21262d' : 'transparent',
              border: `1px solid ${activeTab === 'json' ? '#38bdf8' : 'transparent'}`,
              borderRadius: '6px',
              padding: '4px 10px',
              color: activeTab === 'json' ? '#38bdf8' : '#8b949e',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            JSON Schema
          </button>
        </div>

        <button
          onClick={handleCopy}
          style={{
            background: 'transparent',
            border: '1px solid #30363d',
            borderRadius: '6px',
            padding: '3px 8px',
            color: copied ? '#3fb950' : '#8b949e',
            fontSize: '11px',
            cursor: 'pointer',
          }}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>

      {/* Error notification */}
      {parseError && (
        <div
          style={{
            padding: '8px 16px',
            background: 'rgba(248, 81, 73, 0.1)',
            borderBottom: '1px solid #f85149',
            color: '#f85149',
            fontSize: '11px',
          }}
        >
          {parseError}
        </div>
      )}

      {/* Editor Textarea */}
      <div style={{ flex: 1, padding: '12px', display: 'flex', flexDirection: 'column' }}>
        <textarea
          value={activeTab === 'mermaid' ? mermaidCode : jsonCode}
          onChange={e => {
            if (activeTab === 'mermaid') setMermaidCode(e.target.value);
            else setJsonCode(e.target.value);
          }}
          spellCheck={false}
          style={{
            flex: 1,
            width: '100%',
            background: '#0d1117',
            border: '1px solid #30363d',
            borderRadius: '8px',
            padding: '12px',
            color: '#7ee787',
            fontFamily: 'Consolas, Monaco, "Courier New", monospace',
            fontSize: '12px',
            lineHeight: 1.5,
            resize: 'none',
            outline: 'none',
            whiteSpace: 'pre',
          }}
        />
      </div>

      {/* Action Footer */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #30363d',
          background: '#0d1117',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '8px',
        }}
      >
        <button
          onClick={activeTab === 'mermaid' ? handleApplyMermaid : handleApplyJson}
          style={{
            background: '#238636',
            border: 'none',
            borderRadius: '6px',
            padding: '6px 14px',
            color: '#fff',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Sync Code to Canvas
        </button>
      </div>
    </div>
  );
};

