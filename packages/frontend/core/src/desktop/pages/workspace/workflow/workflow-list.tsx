import { Button, Switch } from '@affine/component';
import { notify } from '@affine/component/ui/notification';
import { DeleteIcon, PlusIcon } from '@blocksuite/icons/rc';
import React, { useState } from 'react';

import { STARTER_WORKFLOWS } from './defaults';
import type { WorkflowItem } from './types';

interface WorkflowListProps {
  workflows: WorkflowItem[];
  onSelectWorkflow: (id: string) => void;
  onCreateWorkflow: () => void;
  onUpdateWorkflow: (updated: WorkflowItem) => void;
  onDeleteWorkflow: (id: string) => void;
  onImportStarter: (starter: WorkflowItem) => void;
}

export const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows,
  onSelectWorkflow,
  onCreateWorkflow,
  onUpdateWorkflow,
  onDeleteWorkflow,
  onImportStarter,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [templateModalOpen, setTemplateModalOpen] = useState(false);

  const filtered = workflows.filter(wf => {
    const matchesSearch =
      wf.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wf.description.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterActive === 'active') return wf.active;
    if (filterActive === 'inactive') return !wf.active;
    return true;
  });

  const totalRuns = workflows.reduce((acc, w) => acc + (w.executionCount || 0), 0);
  const activeCount = workflows.filter(w => w.active).length;

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
          marginBottom: '32px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 700, margin: 0, letterSpacing: '-0.5px' }}>
            AI Automation Workflows
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--affine-text-secondary-color)' }}>
            Build, automate, and orchestrate intelligent multi-step AI workflows connected with your Nexio docs.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button variant="secondary" onClick={() => setTemplateModalOpen(true)}>
            ✨ Explore Templates
          </Button>
          <Button
            variant="primary"
            onClick={onCreateWorkflow}
            prefix={<PlusIcon />}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            }}
          >
            Create Workflow
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
          marginBottom: '28px',
        }}
      >
        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--affine-border-color)',
            backgroundColor: 'var(--affine-background-secondary-color)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)', fontWeight: 500 }}>
            Total Workflows
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px' }}>{workflows.length}</div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--affine-border-color)',
            backgroundColor: 'var(--affine-background-secondary-color)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)', fontWeight: 500 }}>
            Active Automations
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px', color: '#10b981' }}>
            {activeCount}
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            borderRadius: '12px',
            border: '1px solid var(--affine-border-color)',
            backgroundColor: 'var(--affine-background-secondary-color)',
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)', fontWeight: 500 }}>
            Total Executions
          </div>
          <div style={{ fontSize: '28px', fontWeight: 700, marginTop: '4px', color: '#3b82f6' }}>
            {totalRuns}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div style={{ flex: 1, maxWidth: '360px' }}>
          <input
            type="text"
            placeholder="Search workflows..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px',
              borderRadius: '8px',
              border: '1px solid var(--affine-border-color)',
              backgroundColor: 'var(--affine-background-secondary-color)',
              color: 'var(--affine-text-primary-color)',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {(['all', 'active', 'inactive'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setFilterActive(tab)}
              style={{
                padding: '6px 14px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor:
                  filterActive === tab ? 'var(--affine-background-secondary-color)' : 'transparent',
                color:
                  filterActive === tab
                    ? 'var(--affine-text-primary-color)'
                    : 'var(--affine-text-secondary-color)',
                fontWeight: filterActive === tab ? 600 : 400,
                fontSize: '12px',
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.15s ease',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Workflows Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '16px',
        }}
      >
        {filtered.map(wf => (
          <div
            key={wf.id}
            onClick={() => onSelectWorkflow(wf.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              padding: '20px',
              borderRadius: '14px',
              border: '1px solid var(--affine-border-color)',
              backgroundColor: 'var(--affine-background-secondary-color)',
              cursor: 'pointer',
              transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--affine-primary-color, #3b82f6)';
              (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.08)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
              (e.currentTarget as HTMLElement).style.borderColor = 'var(--affine-border-color)';
              (e.currentTarget as HTMLElement).style.boxShadow = 'none';
            }}
          >
            {/* Card Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 600 }}>{wf.name}</div>
                <div
                  style={{
                    fontSize: '12px',
                    color: 'var(--affine-text-secondary-color)',
                    marginTop: '4px',
                    lineHeight: '1.4',
                  }}
                >
                  {wf.description}
                </div>
              </div>

              <div
                onClick={e => e.stopPropagation()}
                style={{ display: 'flex', alignItems: 'center' }}
              >
                <Switch
                  checked={wf.active}
                  onChange={checked => {
                    onUpdateWorkflow({ ...wf, active: checked });
                    notify.info({
                      title: checked ? 'Workflow Activated' : 'Workflow Deactivated',
                      message: `${wf.name} is ${checked ? 'now active' : 'paused'}.`,
                    });
                  }}
                />
              </div>
            </div>

            {/* Nodes Visual Preview Chips */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '6px',
                margin: '16px 0',
              }}
            >
              {wf.nodes.slice(0, 4).map((node, idx) => (
                <React.Fragment key={node.id}>
                  <div
                    style={{
                      padding: '3px 8px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--affine-background-primary-color)',
                      border: '1px solid var(--affine-border-color)',
                      fontSize: '11px',
                      fontWeight: 500,
                    }}
                  >
                    {node.name}
                  </div>
                  {idx < Math.min(wf.nodes.length, 4) - 1 && (
                    <span style={{ color: 'var(--affine-text-secondary-color)', fontSize: '10px' }}>
                      →
                    </span>
                  )}
                </React.Fragment>
              ))}
              {wf.nodes.length > 4 && (
                <span style={{ fontSize: '11px', color: 'var(--affine-text-secondary-color)' }}>
                  +{wf.nodes.length - 4} more
                </span>
              )}
            </div>

            {/* Card Footer */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: '1px solid var(--affine-border-color)',
                marginTop: 'auto',
                fontSize: '11px',
                color: 'var(--affine-text-secondary-color)',
              }}
            >
              <div>
                {wf.executionCount || 0} runs · {wf.lastRunAt ? 'Ran recently' : 'Never ran'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={e => {
                    e.stopPropagation();
                    if (confirm(`Delete workflow "${wf.name}"?`)) {
                      onDeleteWorkflow(wf.id);
                    }
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--affine-text-secondary-color)',
                    padding: '4px',
                  }}
                  title="Delete Workflow"
                >
                  <DeleteIcon />
                </button>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={e => {
                    e.stopPropagation();
                    onSelectWorkflow(wf.id);
                  }}
                >
                  Open Builder
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Templates Modal */}
      {templateModalOpen && (
        <div
          onClick={() => setTemplateModalOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            backdropFilter: 'blur(3px)',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              width: '680px',
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
            <div style={{ padding: '20px', borderBottom: '1px solid var(--affine-border-color)' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>Starter AI Automation Templates</h2>
              <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--affine-text-secondary-color)' }}>
                Instantly import pre-configured workflows to automate notes, research, and notifications.
              </p>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {STARTER_WORKFLOWS.map(template => (
                <div
                  key={template.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid var(--affine-border-color)',
                    backgroundColor: 'var(--affine-background-secondary-color)',
                  }}
                >
                  <div style={{ flex: 1, marginRight: '16px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600 }}>{template.name}</div>
                    <div style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color)', marginTop: '4px' }}>
                      {template.description}
                    </div>
                    <div style={{ fontSize: '11px', color: '#3b82f6', marginTop: '6px' }}>
                      {template.nodes.length} nodes · Includes {template.nodes.map(n => n.name).join(' → ')}
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    onClick={() => {
                      onImportStarter(template);
                      setTemplateModalOpen(false);
                      notify.success({
                        title: 'Template Imported',
                        message: `Imported "${template.name}" into your workspace.`,
                      });
                    }}
                  >
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
