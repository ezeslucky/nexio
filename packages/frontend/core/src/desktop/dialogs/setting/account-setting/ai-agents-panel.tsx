import { Button, Input, Modal, notify } from '@nexio/component';
import { SettingRow } from '@nexio/component/setting-components';
import { ServerService } from '@nexio/core/modules/cloud';
import { useService } from '@toeverything/infra';
import { useCallback, useEffect, useState } from 'react';

export interface Agent {
  id: string;
  name: string;
  description?: string;
  systemPrompt: string;
  modelId: string;
  isReviewRequired: boolean;
  subAgents?: string[];
  isSystem?: boolean;
}

export interface AgentTask {
  id: string;
  agentId: string;
  input: string;
  output?: string;
  status: 'queued' | 'running' | 'done' | 'failed';
  reviewStatus: 'none' | 'pending' | 'approved' | 'rejected';
  reviewSummary?: string;
  changePayload?: any;
  error?: string;
  createdAt: string;
  agent?: { name: string };
}

export const AIAgentsPanel = () => {
  const serverService = useService(ServerService);
  const baseUrl = serverService.server.baseUrl;

  const [agents, setAgents] = useState<Agent[]>([]);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [reviewingTask, setReviewingTask] = useState<AgentTask | null>(null);

  // New agent form fields
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [modelId, setModelId] = useState('auto');
  const [isReviewRequired, setIsReviewRequired] = useState(true);
  const [selectedSubAgents, setSelectedSubAgents] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchAgentsAndTasks = useCallback(async () => {
    try {
      const [agentsRes, tasksRes] = await Promise.all([
        fetch(`${baseUrl}/api/copilot/agents`, { credentials: 'include' }).catch(() => null),
        fetch(`${baseUrl}/api/copilot/tasks?limit=10`, { credentials: 'include' }).catch(() => null),
      ]);

      if (agentsRes && agentsRes.ok) {
        const data = await agentsRes.json();
        if (Array.isArray(data.agents)) setAgents(data.agents);
      }

      if (tasksRes && tasksRes.ok) {
        const data = await tasksRes.json();
        if (Array.isArray(data.tasks)) setTasks(data.tasks);
      }
    } catch (e) {
      console.warn('Failed to fetch agents/tasks:', e);
    }
  }, [baseUrl]);

  useEffect(() => {
    fetchAgentsAndTasks();
    const interval = setInterval(fetchAgentsAndTasks, 8000);
    return () => clearInterval(interval);
  }, [fetchAgentsAndTasks]);

  const handleCreateAgent = async () => {
    if (!name.trim() || !systemPrompt.trim()) {
      notify.error({ title: 'Please provide both Agent Name and Instructions.' });
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`${baseUrl}/api/copilot/agents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          systemPrompt: systemPrompt.trim(),
          modelId,
          isReviewRequired,
          subAgents: selectedSubAgents,
        }),
      });

      if (!res.ok) throw new Error('Failed to create agent');

      notify.success({ title: `Agent "${name}" Created Successfully!` });
      setName('');
      setDescription('');
      setSystemPrompt('');
      setSelectedSubAgents([]);
      setShowCreateModal(false);
      await fetchAgentsAndTasks();
    } catch (e: any) {
      notify.error({ title: 'Error creating agent', message: e.message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleApproveReview = async (taskId: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/copilot/tasks/${taskId}/approve`, {
        method: 'POST',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Approval failed');
      notify.success({ title: 'Changes Approved & Applied!' });
      setReviewingTask(null);
      await fetchAgentsAndTasks();
    } catch (e: any) {
      notify.error({ title: 'Approval error', message: e.message });
    }
  };

  const handleRejectReview = async (taskId: string) => {
    try {
      const res = await fetch(`${baseUrl}/api/copilot/tasks/${taskId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ reason: 'User declined proposed changes.' }),
      });
      if (!res.ok) throw new Error('Rejection failed');
      notify.warning({ title: 'Changes Rejected' });
      setReviewingTask(null);
      await fetchAgentsAndTasks();
    } catch (e: any) {
      notify.error({ title: 'Error', message: e.message });
    }
  };

  return (
    <>
      {/* Agents Roster */}
      <SettingRow
        name="Custom Agents & Sub-Agents"
        desc="Autonomous agents with custom instructions, sub-agent delegation, and safety review before writing."
        spreadCol={false}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--affine-text-secondary-color, #64748b)' }}>
              {agents.length} Agents Available (System & Custom)
            </span>
            <Button variant="primary" size="default" onClick={() => setShowCreateModal(true)}>
              + Create Agent
            </Button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: '12px',
            }}
          >
            {agents.map(a => (
              <div
                key={a.id}
                style={{
                  padding: '14px',
                  borderRadius: '12px',
                  border: '1px solid var(--affine-border-color, #e2e8f0)',
                  backgroundColor: 'var(--affine-background-primary-color, #ffffff)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{a.name}</span>
                  <span
                    style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: a.isSystem ? 'rgba(99, 102, 241, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                      color: a.isSystem ? '#4f46e5' : '#059669',
                      fontWeight: 600,
                    }}
                  >
                    {a.isSystem ? 'SYSTEM' : 'CUSTOM'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--affine-text-secondary-color, #64748b)' }}>
                  {a.description || 'No description provided.'}
                </div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px', fontSize: '11px', flexWrap: 'wrap' }}>
                  <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#f1f5f9', color: '#475569' }}>
                    Model: {a.modelId}
                  </span>
                  {a.isReviewRequired && (
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#fef3c7', color: '#b45309' }}>
                      🛡️ Review For Me
                    </span>
                  )}
                  {a.subAgents && a.subAgents.length > 0 && (
                    <span style={{ padding: '2px 6px', borderRadius: '4px', background: '#ede9fe', color: '#6d28d9' }}>
                      🤝 {a.subAgents.length} Sub-agents
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </SettingRow>

      {/* Background Tasks & Review for Me Queue */}
      {tasks.length > 0 && (
        <SettingRow
          name="Agent Background Tasks & Reviews"
          desc="Monitor autonomous agent jobs and review proposed document edits before they are applied."
          spreadCol={false}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
            {tasks.map(t => {
              const isNeedsReview = t.reviewStatus === 'pending';
              const statusColors: Record<string, { bg: string; color: string }> = {
                queued: { bg: '#fef3c7', color: '#b45309' },
                running: { bg: '#dbeafe', color: '#1d4ed8' },
                done: { bg: '#d1fae5', color: '#047857' },
                failed: { bg: '#fee2e2', color: '#b91c1c' },
              };

              return (
                <div
                  key={t.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: isNeedsReview ? '2px solid #8b5cf6' : '1px solid var(--affine-border-color, #e2e8f0)',
                    backgroundColor: isNeedsReview ? '#faf5ff' : 'var(--affine-background-primary-color, #ffffff)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1, marginRight: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 600, fontSize: '13px' }}>
                        {t.agent?.name || 'Agent Job'}
                      </span>
                      <span
                        style={{
                          fontSize: '10px',
                          padding: '1px 6px',
                          borderRadius: '4px',
                          fontWeight: 600,
                          backgroundColor: isNeedsReview ? '#8b5cf6' : (statusColors[t.status]?.bg || '#f1f5f9'),
                          color: isNeedsReview ? '#ffffff' : (statusColors[t.status]?.color || '#475569'),
                        }}
                      >
                        {isNeedsReview ? 'NEEDS REVIEW' : t.status.toUpperCase()}
                      </span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {t.input}
                    </div>
                  </div>

                  {isNeedsReview ? (
                    <Button variant="primary" size="default" onClick={() => setReviewingTask(t)}>
                      Review Changes →
                    </Button>
                  ) : (
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {new Date(t.createdAt).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </SettingRow>
      )}

      {/* Create Agent Modal */}
      <Modal
        open={showCreateModal}
        onOpenChange={open => setShowCreateModal(open)}
        width={520}
        title="Create Custom Agent"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 0' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Agent Name
            </label>
            <Input placeholder="e.g. Security Auditor" value={name} onChange={setName} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Description
            </label>
            <Input placeholder="What does this agent do?" value={description} onChange={setDescription} />
          </div>

          <div>
            <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              Instructions (System Prompt)
            </label>
            <textarea
              style={{
                width: '100%',
                height: '90px',
                borderRadius: '8px',
                border: '1px solid var(--affine-border-color, #e2e8f0)',
                padding: '8px 10px',
                fontSize: '13px',
                fontFamily: 'inherit',
                boxSizing: 'border-box',
              }}
              placeholder="Specify the behavior, role, rules, and output style..."
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Preferred Model
              </label>
              <select
                value={modelId}
                onChange={e => setModelId(e.target.value)}
                style={{
                  width: '100%',
                  height: '36px',
                  borderRadius: '6px',
                  border: '1px solid var(--affine-border-color, #e2e8f0)',
                  padding: '0 8px',
                }}
              >
                <option value="auto">Auto (Intelligent Router)</option>
                <option value="gpt-4o">GPT-4o (Reasoning)</option>
                <option value="gpt-4o-mini">GPT-4o Mini (Fast)</option>
                <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
              </select>
            </div>

            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Safety Mode
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', height: '36px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={isReviewRequired}
                  onChange={e => setIsReviewRequired(e.target.checked)}
                />
                <span>Review For Me</span>
              </label>
            </div>
          </div>

          {agents.length > 0 && (
            <div>
              <label style={{ fontSize: '13px', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                Sub-Agents Delegation (Optional)
              </label>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {agents.map(a => {
                  const isSelected = selectedSubAgents.includes(a.id);
                  return (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setSelectedSubAgents(prev =>
                          isSelected ? prev.filter(id => id !== a.id) : [...prev, a.id]
                        );
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '9999px',
                        border: isSelected ? '1px solid #2563eb' : '1px solid #cbd5e1',
                        backgroundColor: isSelected ? '#dbeafe' : '#ffffff',
                        color: isSelected ? '#1e40af' : '#475569',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: isSelected ? 600 : 400,
                      }}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {a.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' }}>
            <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="primary" loading={isSaving} disabled={isSaving} onClick={handleCreateAgent}>
              Create Agent
            </Button>
          </div>
        </div>
      </Modal>

      {/* Review For Me Modal */}
      <Modal
        open={!!reviewingTask}
        onOpenChange={open => !open && setReviewingTask(null)}
        width={560}
        title="Review For Me — Proposed Changes"
      >
        {reviewingTask && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', padding: '16px 0' }}>
            <div
              style={{
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: '#fef3c7',
                border: '1px solid #fde68a',
                color: '#92400e',
                fontSize: '13px',
              }}
            >
              🛡️ <strong>Safety Review Active</strong>: The agent proposed modifications. Review the summary below before applying changes to your document.
            </div>

            <div style={{ fontSize: '13px', fontWeight: 600 }}>Summary of Change:</div>
            <div
              style={{
                padding: '12px',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '13px',
                lineHeight: '1.6',
              }}
            >
              {reviewingTask.reviewSummary || 'Proposed updates to document content.'}
            </div>

            <div style={{ fontSize: '13px', fontWeight: 600 }}>Agent Output Preview:</div>
            <div
              style={{
                maxHeight: '180px',
                overflowY: 'auto',
                padding: '12px',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '12px',
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
              }}
            >
              {reviewingTask.output || 'No output preview available.'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
              <Button variant="error" onClick={() => handleRejectReview(reviewingTask.id)}>
                Reject & Discard
              </Button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button onClick={() => setReviewingTask(null)}>Close</Button>
                <Button variant="primary" onClick={() => handleApproveReview(reviewingTask.id)}>
                  Approve & Apply Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
};
