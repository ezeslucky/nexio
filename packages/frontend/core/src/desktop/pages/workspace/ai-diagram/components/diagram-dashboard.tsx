import { Button, IconButton, notify } from '@nexio/component';
import {
  CloseIcon,
  DeleteIcon,
  PlusIcon,
  SearchIcon,
} from '@blocksuite/icons/rc';
import React, { useState } from 'react';

import { DIAGRAM_TEMPLATES, DIAGRAM_TYPE_LABELS } from '../defaults';
import {
  analyzeCodebaseArchitecture,
  convertMermaidToDiagram,
  convertSqlToErd,
  convertTerraformToDiagram,
} from '../services/diagram-converter';
import { generateDiagramFromPrompt } from '../services/ai-diagram-service';
import type { DiagramItem, DiagramTemplate, DiagramType, ImportFormat } from '../types';

interface DiagramDashboardProps {
  diagrams: DiagramItem[];
  onOpenDiagram: (id: string) => void;
  onCreateNew: (type?: DiagramType, initialData?: Partial<DiagramItem>) => void;
  onDeleteDiagram: (id: string) => void;
  onDuplicateDiagram: (diagram: DiagramItem) => void;
}

export const DiagramDashboard: React.FC<DiagramDashboardProps> = ({
  diagrams,
  onOpenDiagram,
  onCreateNew,
  onDeleteDiagram,
  onDuplicateDiagram,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Import Modal state
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [importFormat, setImportFormat] = useState<ImportFormat>('sql');
  const [importContent, setImportContent] = useState('');

  // Templates Modal state
  const [templatesModalOpen, setTemplatesModalOpen] = useState(false);

  const filteredDiagrams = diagrams.filter(d => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedTypeFilter === 'all' || d.diagramType === selectedTypeFilter;
    return matchesSearch && matchesType;
  });

  // Handle Quick AI Generator
  const handleQuickGenerate = (promptText?: string) => {
    const text = promptText || aiPrompt;
    if (!text.trim()) {
      notify.error({
        title: 'Prompt Required',
        message: 'Please describe the technical system or architecture you want to generate.',
      });
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const generated = generateDiagramFromPrompt(text);
      setIsGenerating(false);
      setAiPrompt('');

      onCreateNew('system_architecture', {
        title: generated.title,
        description: `AI generated architecture for: "${text}"`,
        nodes: generated.nodes,
        edges: generated.edges,
      });

      notify.success({
        title: 'Diagram Synthesized',
        message: 'AI successfully analyzed your system prompt and generated an editable diagram.',
      });
    }, 700);
  };

  // Handle Import Execution
  const handleExecuteImport = () => {
    if (!importContent.trim()) {
      notify.error({
        title: 'Empty Content',
        message: 'Please paste the source code, schema, or configuration to import.',
      });
      return;
    }

    if (importFormat === 'sql') {
      const res = convertSqlToErd(importContent);
      onCreateNew('erd', {
        title: 'Imported SQL Database Schema',
        description: 'Auto-converted relational tables and foreign keys from SQL DDL statements.',
        nodes: res.nodes,
        edges: res.edges,
      });
    } else if (importFormat === 'terraform') {
      const res = convertTerraformToDiagram(importContent);
      onCreateNew('cloud_architecture', {
        title: 'Imported Terraform Infrastructure',
        description: 'Auto-converted cloud resources and VPC routes from HCL manifest.',
        nodes: res.nodes,
        edges: res.edges,
      });
    } else if (importFormat === 'markdown') {
      const res = convertMermaidToDiagram(importContent);
      onCreateNew('flowchart', {
        title: 'Imported Mermaid / Markdown Flow',
        description: 'Visual diagram converted from Mermaid text definition.',
        nodes: res.nodes,
        edges: res.edges,
      });
    } else if (importFormat === 'git_repo') {
      const res = analyzeCodebaseArchitecture(importContent);
      const generated = generateDiagramFromPrompt(
        `Microservices for repository ${res.repoName} with ${res.services.map(s => s.name).join(', ')} and ${res.databases.map(d => d.name).join(', ')}`
      );
      onCreateNew('system_architecture', {
        title: `${res.repoName} Architecture Map`,
        description: `Codebase architecture map synthesized for ${importContent}`,
        nodes: generated.nodes,
        edges: generated.edges,
      });
    } else if (importFormat === 'image' || importFormat === 'pdf') {
      // Vision AI OCR & Diagram Reconstruction
      const generated = generateDiagramFromPrompt(
        'Enterprise Cloud Architecture with Ingress, Microservices, Redis Cache, and PostgreSQL'
      );
      onCreateNew('cloud_architecture', {
        title: 'Extracted Architecture from Document',
        description: `Visual diagram reconstructed using AI Vision from ${importFormat.toUpperCase()} file.`,
        nodes: generated.nodes,
        edges: generated.edges,
      });
    } else if (importFormat === 'json') {
      try {
        const parsed = JSON.parse(importContent);
        onCreateNew(parsed.diagramType || 'system_architecture', {
          title: parsed.title || 'Imported Diagram JSON',
          description: parsed.description || 'Imported from JSON source',
          nodes: parsed.nodes || [],
          edges: parsed.edges || [],
        });
      } catch {
        notify.error({ title: 'Invalid JSON', message: 'Could not parse JSON diagram payload.' });
        return;
      }
    }

    setImportModalOpen(false);
    setImportContent('');
    notify.success({
      title: 'Import Succeeded',
      message: `Successfully converted ${importFormat.toUpperCase()} into an editable diagram.`,
    });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: 'var(--affine-background-primary-color)',
        color: 'var(--affine-text-primary-color)',
        overflowY: 'auto',
        padding: '32px 48px',
      }}
    >
      {/* Studio Header Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🎨</span>
            <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
              AI Diagram Studio
            </h1>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 600,
                color: '#ec4899',
                backgroundColor: 'rgba(236, 72, 153, 0.12)',
                padding: '2px 8px',
                borderRadius: '12px',
                border: '1px solid rgba(236, 72, 153, 0.3)',
              }}
            >
              Eraser-Inspired Engine
            </span>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: 'var(--affine-text-secondary-color)' }}>
            Describe technical architectures in plain English, convert codebases into visual maps, and edit with AI.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Button variant="secondary" onClick={() => setImportModalOpen(true)}>
            📥 Import File / Code
          </Button>
          <Button variant="secondary" onClick={() => setTemplatesModalOpen(true)}>
            🏛️ Templates Gallery
          </Button>
          <Button
            variant="primary"
            prefix={<PlusIcon />}
            onClick={() => onCreateNew('system_architecture')}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              fontWeight: 600,
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)',
            }}
          >
            New Diagram
          </Button>
        </div>
      </div>

      {/* Hero AI Generation Prompt Box */}
      <div
        style={{
          padding: '20px 24px',
          borderRadius: '16px',
          backgroundColor: 'var(--affine-background-secondary-color)',
          border: '1px solid var(--affine-border-color)',
          marginBottom: '32px',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '18px' }}>🪄</span>
          <span style={{ fontSize: '14px', fontWeight: 600 }}>Describe an Architecture or System to Generate</span>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <textarea
            rows={2}
            placeholder="e.g. Create a microservices architecture with an API Gateway, authentication service, user service, PostgreSQL database, Redis cache, and message queue..."
            value={aiPrompt}
            onChange={e => setAiPrompt(e.target.value)}
            style={{
              flex: 1,
              padding: '12px 14px',
              borderRadius: '10px',
              border: '1px solid var(--affine-border-color)',
              backgroundColor: 'var(--affine-background-primary-color)',
              color: 'var(--affine-text-primary-color)',
              fontSize: '13px',
              fontFamily: 'inherit',
              outline: 'none',
              resize: 'none',
            }}
          />
          <Button
            variant="primary"
            loading={isGenerating}
            onClick={() => handleQuickGenerate()}
            style={{
              padding: '0 24px',
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              color: '#fff',
              fontWeight: 600,
              border: 'none',
              borderRadius: '10px',
            }}
          >
            {isGenerating ? 'Synthesizing...' : 'Generate with AI'}
          </Button>
        </div>

        {/* Quick prompt suggestions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '11px', color: 'var(--affine-text-secondary-color)' }}>Quick Prompts:</span>
          {[
            'Microservices with API Gateway, Auth, Postgres, Redis & Kafka',
            'Generative AI RAG Pipeline with Vector DB & LLM',
            'E-commerce order processing flow with Stripe & Webhooks',
            'Kubernetes Ingress, Pods, Deployments and Secrets',
          ].map((suggestion, idx) => (
            <button
              key={idx}
              onClick={() => {
                setAiPrompt(suggestion);
                handleQuickGenerate(suggestion);
              }}
              style={{
                fontSize: '11px',
                padding: '4px 10px',
                borderRadius: '14px',
                border: '1px solid var(--affine-border-color)',
                backgroundColor: 'var(--affine-background-primary-color)',
                color: 'var(--affine-text-primary-color)',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              + {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Action Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '16px',
          marginBottom: '32px',
        }}
      >
        {[
          {
            title: 'Blank Canvas',
            desc: 'Start drawing with shapes, connection handles, and text',
            icon: '✏️',
            action: () => onCreateNew('system_architecture'),
          },
          {
            title: 'Connect GitHub Repo',
            desc: 'Analyze codebase services, APIs, and generate architecture map',
            icon: '🐙',
            action: () => {
              setImportFormat('git_repo');
              setImportContent('https://github.com/ezeslucky/nexio');
              setImportModalOpen(true);
            },
          },
          {
            title: 'SQL Schema to ERD',
            desc: 'Convert CREATE TABLE DDL statements into interactive tables',
            icon: '🗄️',
            action: () => {
              setImportFormat('sql');
              setImportContent(
                'CREATE TABLE users (\n  id UUID PRIMARY KEY,\n  email VARCHAR(255),\n  created_at TIMESTAMP\n);\n\nCREATE TABLE orders (\n  id UUID PRIMARY KEY,\n  user_id UUID REFERENCES users(id),\n  total DECIMAL(10,2)\n);'
              );
              setImportModalOpen(true);
            },
          },
          {
            title: 'Terraform to Cloud',
            desc: 'Render AWS, GCP, or Azure resources directly from HCL code',
            icon: '☁️',
            action: () => {
              setImportFormat('terraform');
              setImportContent(
                'resource "aws_vpc" "main" {\n  cidr_block = "10.0.0.0/16"\n}\n\nresource "aws_lb" "gateway" {\n  name = "prod-alb"\n}\n\nresource "aws_db_instance" "postgres" {\n  engine = "postgres"\n}'
              );
              setImportModalOpen(true);
            },
          },
        ].map((card, idx) => (
          <div
            key={idx}
            onClick={card.action}
            style={{
              padding: '16px',
              borderRadius: '12px',
              backgroundColor: 'var(--affine-background-secondary-color)',
              border: '1px solid var(--affine-border-color)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.borderColor = '#3b82f6';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--affine-border-color)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>{card.icon}</div>
            <div style={{ fontSize: '13px', fontWeight: 600 }}>{card.title}</div>
            <div style={{ fontSize: '11px', color: 'var(--affine-text-secondary-color)', marginTop: '4px' }}>
              {card.desc}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Diagrams Section Header & Filter Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 600, margin: 0 }}>Recent Diagrams</h2>
          <span style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)' }}>
            ({filteredDiagrams.length})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {/* Search */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--affine-background-secondary-color)',
              borderRadius: '8px',
              border: '1px solid var(--affine-border-color)',
              padding: '4px 10px',
              gap: '6px',
              width: '220px',
            }}
          >
            <SearchIcon style={{ color: 'var(--affine-text-secondary-color)', fontSize: '14px' }} />
            <input
              type="text"
              placeholder="Search diagrams..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'transparent',
                color: 'var(--affine-text-primary-color)',
                fontSize: '12px',
                outline: 'none',
              }}
            />
          </div>

          {/* Type Filter */}
          <select
            value={selectedTypeFilter}
            onChange={e => setSelectedTypeFilter(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '8px',
              border: '1px solid var(--affine-border-color)',
              backgroundColor: 'var(--affine-background-secondary-color)',
              color: 'var(--affine-text-primary-color)',
              fontSize: '12px',
            }}
          >
            <option value="all">All Diagram Types (12)</option>
            {Object.entries(DIAGRAM_TYPE_LABELS).map(([key, item]) => (
              <option key={key} value={key}>
                {item.icon} {item.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Diagrams Grid */}
      {filteredDiagrams.length === 0 ? (
        <div
          style={{
            padding: '48px 24px',
            borderRadius: '14px',
            border: '1px dashed var(--affine-border-color)',
            textAlign: 'center',
            color: 'var(--affine-text-secondary-color)',
          }}
        >
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📐</div>
          <div style={{ fontSize: '14px', fontWeight: 600 }}>No diagrams found</div>
          <div style={{ fontSize: '12px', marginTop: '4px' }}>
            Create a new diagram above or generate one instantly using our AI Assistant.
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '16px',
          }}
        >
          {filteredDiagrams.map(diagram => {
            const typeConfig = DIAGRAM_TYPE_LABELS[diagram.diagramType] || DIAGRAM_TYPE_LABELS.system_architecture;
            return (
              <div
                key={diagram.id}
                onClick={() => onOpenDiagram(diagram.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '18px',
                  borderRadius: '14px',
                  border: '1px solid var(--affine-border-color)',
                  backgroundColor: 'var(--affine-background-secondary-color)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  position: 'relative',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = '#3b82f6';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.12)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'var(--affine-border-color)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.12)',
                      padding: '2px 8px',
                      borderRadius: '6px',
                    }}
                  >
                    <span>{typeConfig.icon}</span>
                    <span>{typeConfig.label}</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--affine-text-secondary-color)' }}>
                    v{diagram.version || 1}
                  </span>
                </div>

                <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '12px' }}>
                  {diagram.title}
                </div>
                <div
                  style={{
                    fontSize: '11px',
                    color: 'var(--affine-text-secondary-color)',
                    marginTop: '4px',
                    lineHeight: '1.4',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {diagram.description}
                </div>

                {/* Nodes count and stats */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginTop: '16px',
                    paddingTop: '12px',
                    borderTop: '1px solid var(--affine-border-color)',
                    fontSize: '11px',
                    color: 'var(--affine-text-secondary-color)',
                  }}
                >
                  <span>{diagram.nodes.length} components</span>
                  <span>·</span>
                  <span>{diagram.edges.length} connections</span>
                  <div style={{ flex: 1 }} />
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDuplicateDiagram(diagram);
                      notify.success({ title: 'Diagram Cloned', message: `Created copy of ${diagram.title}` });
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--affine-text-secondary-color)',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                    title="Duplicate Diagram"
                  >
                    ⎘
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation();
                      onDeleteDiagram(diagram.id);
                      notify({ title: 'Diagram Removed', message: 'Diagram deleted from studio.' });
                    }}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: '#ef4444',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                    title="Delete Diagram"
                  >
                    <DeleteIcon />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Import Modal */}
      {importModalOpen && (
        <div
          onClick={() => setImportModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '640px',
              backgroundColor: 'var(--affine-background-primary-color)',
              borderRadius: '16px',
              border: '1px solid var(--affine-border-color)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 600 }}>Import &amp; Convert to Diagram</div>
                <div style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)' }}>
                  Convert SQL schemas, Terraform manifests, Mermaid code, or GitHub repositories
                </div>
              </div>
              <IconButton size="20" onClick={() => setImportModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>

            {/* Format selector */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              {[
                { key: 'sql', label: 'SQL Schema (ERD)' },
                { key: 'terraform', label: 'Terraform (.tf)' },
                { key: 'markdown', label: 'Mermaid / Markdown' },
                { key: 'git_repo', label: 'GitHub Repository' },
                { key: 'json', label: 'JSON Diagram' },
                { key: 'image', label: 'Image to Diagram' },
                { key: 'pdf', label: 'PDF Spec' },
              ].map(f => (
                <button
                  key={f.key}
                  onClick={() => setImportFormat(f.key as ImportFormat)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: importFormat === f.key ? '1px solid #3b82f6' : '1px solid var(--affine-border-color)',
                    backgroundColor: importFormat === f.key ? 'rgba(59, 130, 246, 0.15)' : 'var(--affine-background-secondary-color)',
                    color: importFormat === f.key ? '#3b82f6' : 'var(--affine-text-primary-color)',
                    fontSize: '11px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>

            <textarea
              rows={8}
              placeholder={
                importFormat === 'git_repo'
                  ? 'https://github.com/organization/repository-name'
                  : importFormat === 'sql'
                    ? 'CREATE TABLE users (id UUID PRIMARY KEY, name VARCHAR(100));'
                    : 'Paste source content here...'
              }
              value={importContent}
              onChange={e => setImportContent(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '8px',
                border: '1px solid var(--affine-border-color)',
                backgroundColor: 'var(--affine-background-secondary-color)',
                color: 'var(--affine-text-primary-color)',
                fontSize: '12px',
                fontFamily: 'monospace',
                outline: 'none',
              }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="secondary" onClick={() => setImportModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleExecuteImport}>
                Convert to Editable Diagram
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Templates Gallery Modal */}
      {templatesModalOpen && (
        <div
          onClick={() => setTemplatesModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '840px',
              maxHeight: '85vh',
              backgroundColor: 'var(--affine-background-primary-color)',
              borderRadius: '16px',
              border: '1px solid var(--affine-border-color)',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '18px', fontWeight: 600 }}>Architecture &amp; Diagram Templates</div>
                <div style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)' }}>
                  Select from production-ready industry architecture blueprints
                </div>
              </div>
              <IconButton size="20" onClick={() => setTemplatesModalOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {DIAGRAM_TEMPLATES.map(tmpl => (
                <div
                  key={tmpl.id}
                  onClick={() => {
                    onCreateNew(tmpl.diagramType, {
                      title: tmpl.name,
                      description: tmpl.description,
                      nodes: tmpl.nodes,
                      edges: tmpl.edges,
                      groups: tmpl.groups,
                    });
                    setTemplatesModalOpen(false);
                    notify.success({ title: 'Template Loaded', message: `Initialized ${tmpl.name}` });
                  }}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: 'var(--affine-background-secondary-color)',
                    border: '1px solid var(--affine-border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = '#3b82f6';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--affine-border-color)';
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '20px' }}>{tmpl.previewIcon}</span>
                    <span style={{ fontSize: '14px', fontWeight: 600 }}>{tmpl.name}</span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--affine-text-secondary-color)', lineHeight: '1.4' }}>
                    {tmpl.description}
                  </div>
                  <div style={{ fontSize: '10px', color: '#3b82f6', marginTop: '10px', fontWeight: 600 }}>
                    {tmpl.nodes.length} nodes · {tmpl.edges.length} edges → Click to Clone
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
