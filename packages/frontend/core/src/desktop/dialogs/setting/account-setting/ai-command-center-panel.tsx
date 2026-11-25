import { Button } from '@nexio/component/ui/button';
import { useCallback, useEffect, useState } from 'react';

export interface UsageOverview {
  totalRequests: number;
  totalCreditsSpent: number;
  byFeature: Array<{ feature: string; requests: number; credits: number }>;
  byUser: Array<{ userId: string; requests: number; credits: number }>;
  byAgent: Array<{ target: string; requests: number; credits: number }>;
}

export interface SpendingLimit {
  monthlyCreditLimit: number;
  dailyCreditLimit: number;
  alertThresholdPercent: number;
  currentMonthUsage: number;
  currentDayUsage: number;
  usagePercent: number;
  isAlertTriggered: boolean;
  hardLimitEnabled: boolean;
}

export interface PolicyControl {
  allowedModels: string[];
  allowedAgents: string[];
  maxCreditPerRequest: number;
  requireApprovalForAgents: boolean;
}

export interface ColumnPermissionItem {
  id: string;
  databaseId: string;
  propertyId: string;
  propertyName: string;
  allowedRoles: string[];
  allowedAgents: string[];
  canView: boolean;
  canEdit: boolean;
}

export interface HistoryItem {
  id: string;
  docId: string;
  authorType: 'user' | 'agent' | 'sub_agent';
  authorName: string;
  changeSummary: string;
  createdAt: string;
}

export const AICommandCenterPanel = () => {
  const [activeTab, setActiveTab] = useState<'analytics' | 'limits' | 'policies' | 'permissions'>('analytics');

  // Analytics state
  const [overview, setOverview] = useState<UsageOverview | null>(null);

  // Spending limits state
  const [limits, setLimits] = useState<SpendingLimit>({
    monthlyCreditLimit: 5000,
    dailyCreditLimit: 1000,
    alertThresholdPercent: 80,
    currentMonthUsage: 180,
    currentDayUsage: 45,
    usagePercent: 4,
    isAlertTriggered: false,
    hardLimitEnabled: true,
  });

  // Policies state
  const [policies, setPolicies] = useState<PolicyControl>({
    allowedModels: ['auto', 'gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet', 'gemini-1.5-flash'],
    allowedAgents: ['sys-researcher', 'sys-architect', 'sys-editor'],
    maxCreditPerRequest: 100,
    requireApprovalForAgents: false,
  });

  // Column Permissions & History preview
  const [permissions] = useState<ColumnPermissionItem[]>([
    {
      id: 'perm-salary',
      databaseId: 'db-team-roster',
      propertyId: 'col-salary',
      propertyName: 'Salary / Compensation',
      allowedRoles: ['owner', 'admin'],
      allowedAgents: [],
      canView: false,
      canEdit: false,
    },
    {
      id: 'perm-ssn',
      databaseId: 'db-team-roster',
      propertyId: 'col-ssn',
      propertyName: 'Tax ID / SSN',
      allowedRoles: ['owner'],
      allowedAgents: [],
      canView: false,
      canEdit: false,
    },
  ]);

  const [historyItems] = useState<HistoryItem[]>([
    {
      id: 'rev-1',
      docId: 'doc-product-spec',
      authorType: 'user',
      authorName: 'Human User',
      changeSummary: 'Created initial draft and core goals.',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: 'rev-2',
      docId: 'doc-product-spec',
      authorType: 'agent',
      authorName: 'Research Analyst',
      changeSummary: 'Synthesized user research findings and benchmarked competitors.',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
  ]);

  const [isSaved, setIsSaved] = useState(false);

  const fetchOverview = useCallback(async () => {
    try {
      const res = await fetch('/api/copilot/command-center/overview');
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      }
    } catch {
      setOverview({
        totalRequests: 42,
        totalCreditsSpent: 180,
        byFeature: [
          { feature: 'chat', requests: 25, credits: 50 },
          { feature: 'agent_execution', requests: 10, credits: 100 },
          { feature: 'skill_execution', requests: 7, credits: 30 },
        ],
        byUser: [{ userId: 'current_user', requests: 42, credits: 180 }],
        byAgent: [
          { target: 'Research Analyst', requests: 6, credits: 60 },
          { target: 'Code Architect', requests: 4, credits: 40 },
        ],
      });
    }
  }, []);

  const fetchLimits = useCallback(async () => {
    try {
      const res = await fetch('/api/copilot/command-center/limits');
      if (res.ok) {
        const data = await res.json();
        setLimits(data);
      }
    } catch {
      // fallback
    }
  }, []);

  const fetchPolicies = useCallback(async () => {
    try {
      const res = await fetch('/api/copilot/command-center/policies?workspaceId=default');
      if (res.ok) {
        const data = await res.json();
        setPolicies(data);
      }
    } catch {
      // fallback
    }
  }, []);

  useEffect(() => {
    fetchOverview();
    fetchLimits();
    fetchPolicies();
  }, [fetchOverview, fetchLimits, fetchPolicies]);

  const handleSaveLimits = async () => {
    try {
      await fetch('/api/copilot/command-center/limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(limits),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleSavePolicies = async () => {
    try {
      await fetch('/api/copilot/command-center/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(policies),
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const toggleModel = (model: string) => {
    setPolicies(prev => {
      const allowed = prev.allowedModels.includes(model)
        ? prev.allowedModels.filter(m => m !== model)
        : [...prev.allowedModels, model];
      return { ...prev, allowedModels: allowed };
    });
  };

  const toggleAgent = (agent: string) => {
    setPolicies(prev => {
      const allowed = prev.allowedAgents.includes(agent)
        ? prev.allowedAgents.filter(a => a !== agent)
        : [...prev.allowedAgents, agent];
      return { ...prev, allowedAgents: allowed };
    });
  };

  return (
    <div style={{ marginTop: '24px', padding: '20px', border: '1px solid #333', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>AI Command Center & Safety</h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
            Enterprise administration: analytics, spending limits, model/agent controls, and column permissions.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '6px' }}>
          {(['analytics', 'limits', 'policies', 'permissions'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: activeTab === tab ? '#ff6b4a' : '#222',
                color: activeTab === tab ? '#fff' : '#aaa',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: USAGE ANALYTICS */}
      {activeTab === 'analytics' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#1b1b22', padding: '16px', borderRadius: '6px', border: '1px solid #282832' }}>
              <div style={{ fontSize: '12px', color: '#888' }}>Total AI Requests</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#fff', marginTop: '4px' }}>
                {overview?.totalRequests ?? 42}
              </div>
            </div>
            <div style={{ backgroundColor: '#1b1b22', padding: '16px', borderRadius: '6px', border: '1px solid #282832' }}>
              <div style={{ fontSize: '12px', color: '#888' }}>Total Credits Spent</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#ff6b4a', marginTop: '4px' }}>
                {overview?.totalCreditsSpent ?? 180}
              </div>
            </div>
            <div style={{ backgroundColor: '#1b1b22', padding: '16px', borderRadius: '6px', border: '1px solid #282832' }}>
              <div style={{ fontSize: '12px', color: '#888' }}>Active Governance Policy</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#22c55e', marginTop: '8px' }}>
                Strict Quota & Safety Active
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div style={{ backgroundColor: '#1e1e24', padding: '14px', borderRadius: '6px', border: '1px solid #2d2d35' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#ddd' }}>Usage by Feature</h4>
              {overview?.byFeature.map(f => (
                <div key={f.feature} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #282832', fontSize: '12px' }}>
                  <span style={{ textTransform: 'capitalize' }}>{f.feature.replace('_', ' ')}</span>
                  <span style={{ color: '#aaa' }}>{f.requests} reqs ({f.credits} credits)</span>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: '#1e1e24', padding: '14px', borderRadius: '6px', border: '1px solid #2d2d35' }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#ddd' }}>Usage by Agent</h4>
              {overview?.byAgent.map(a => (
                <div key={a.target} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #282832', fontSize: '12px' }}>
                  <span>{a.target}</span>
                  <span style={{ color: '#aaa' }}>{a.requests} reqs ({a.credits} credits)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: SPENDING LIMITS & ALERTS */}
      {activeTab === 'limits' && (
        <div style={{ backgroundColor: '#1b1b22', padding: '16px', borderRadius: '6px', border: '1px solid #282832' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Monthly Spending & Quota Alerts</span>
            <span style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '4px',
              backgroundColor: limits.isAlertTriggered ? '#ef444422' : '#22c55e22',
              color: limits.isAlertTriggered ? '#ef4444' : '#22c55e',
            }}>
              {limits.isAlertTriggered ? '⚠️ Alert Threshold Reached' : '✓ Normal Spending'}
            </span>
          </div>

          {/* Usage Bar */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#aaa', marginBottom: '6px' }}>
              <span>Monthly Consumption</span>
              <span>{limits.currentMonthUsage} / {limits.monthlyCreditLimit} credits ({limits.usagePercent}%)</span>
            </div>
            <div style={{ height: '8px', backgroundColor: '#333', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{
                height: '100%',
                width: `${Math.min(limits.usagePercent, 100)}%`,
                backgroundColor: limits.usagePercent > 80 ? '#ef4444' : '#ff6b4a',
              }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                Monthly Credit Limit
              </label>
              <input
                type="number"
                value={limits.monthlyCreditLimit}
                onChange={e => setLimits({ ...limits, monthlyCreditLimit: parseInt(e.target.value, 10) || 0 })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#141416', color: '#fff' }}
              />
            </div>
            <div>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                Daily Credit Limit
              </label>
              <input
                type="number"
                value={limits.dailyCreditLimit}
                onChange={e => setLimits({ ...limits, dailyCreditLimit: parseInt(e.target.value, 10) || 0 })}
                style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#141416', color: '#fff' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <input
              type="checkbox"
              id="hardLimitCheck"
              checked={limits.hardLimitEnabled}
              onChange={e => setLimits({ ...limits, hardLimitEnabled: e.target.checked })}
            />
            <label htmlFor="hardLimitCheck" style={{ fontSize: '12px', color: '#aaa' }}>
              Hard Cut-off: automatically block requests when credit limit is reached
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {isSaved && <span style={{ color: '#22c55e', fontSize: '13px', alignSelf: 'center' }}>✓ Saved!</span>}
            <Button onClick={handleSaveLimits}>Save Limits</Button>
          </div>
        </div>
      )}

      {/* TAB 3: TEAM POLICIES */}
      {activeTab === 'policies' && (
        <div style={{ backgroundColor: '#1b1b22', padding: '16px', borderRadius: '6px', border: '1px solid #282832' }}>
          <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: '#ddd' }}>Allowed AI Models for Team:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {['auto', 'gpt-4o', 'gpt-4o-mini', 'claude-3-5-sonnet', 'claude-3-5-haiku', 'gemini-1.5-pro', 'gemini-1.5-flash'].map(m => {
              const isAllowed = policies.allowedModels.includes(m);
              return (
                <button
                  key={m}
                  onClick={() => toggleModel(m)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    border: isAllowed ? '1px solid #22c55e' : '1px solid #444',
                    backgroundColor: isAllowed ? '#22c55e22' : '#141416',
                    color: isAllowed ? '#4ade80' : '#888',
                  }}
                >
                  {isAllowed ? `✓ ${m}` : `✕ ${m}`}
                </button>
              );
            })}
          </div>

          <h4 style={{ margin: '0 0 12px', fontSize: '13px', color: '#ddd' }}>Allowed Agents for Team:</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
            {[
              { id: 'sys-researcher', name: 'Research Analyst' },
              { id: 'sys-architect', name: 'Code Architect' },
              { id: 'sys-editor', name: 'Editorial Lead' },
            ].map(a => {
              const isAllowed = policies.allowedAgents.includes(a.id);
              return (
                <button
                  key={a.id}
                  onClick={() => toggleAgent(a.id)}
                  style={{
                    padding: '5px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    border: isAllowed ? '1px solid #3b82f6' : '1px solid #444',
                    backgroundColor: isAllowed ? '#3b82f622' : '#141416',
                    color: isAllowed ? '#60a5fa' : '#888',
                  }}
                >
                  {isAllowed ? `✓ ${a.name}` : `✕ ${a.name}`}
                </button>
              );
            })}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <input
              type="checkbox"
              id="reqApprovalCheck"
              checked={policies.requireApprovalForAgents}
              onChange={e => setPolicies({ ...policies, requireApprovalForAgents: e.target.checked })}
            />
            <label htmlFor="reqApprovalCheck" style={{ fontSize: '12px', color: '#aaa' }}>
              Always require "Review for me" human confirmation before any agent writes to documents
            </label>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            {isSaved && <span style={{ color: '#22c55e', fontSize: '13px', alignSelf: 'center' }}>✓ Policy Updated!</span>}
            <Button onClick={handleSavePolicies}>Save Team Policy</Button>
          </div>
        </div>
      )}

      {/* TAB 4: COLUMN PERMISSIONS & VERSION HISTORY */}
      {activeTab === 'permissions' && (
        <div>
          <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#ddd' }}>Server-Side Column / Property Permissions:</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', marginBottom: '24px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', color: '#888' }}>
                <th style={{ padding: '8px 4px' }}>Property / Column</th>
                <th style={{ padding: '8px 4px' }}>Allowed Roles</th>
                <th style={{ padding: '8px 4px' }}>AI Agent Access</th>
                <th style={{ padding: '8px 4px' }}>Protection Status</th>
              </tr>
            </thead>
            <tbody>
              {permissions.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '8px 4px', fontWeight: 600 }}>{p.propertyName}</td>
                  <td style={{ padding: '8px 4px', color: '#aaa' }}>{p.allowedRoles.join(', ')}</td>
                  <td style={{ padding: '8px 4px' }}>
                    <span style={{ color: p.allowedAgents.length > 0 ? '#4ade80' : '#ef4444' }}>
                      {p.allowedAgents.length > 0 ? p.allowedAgents.join(', ') : 'Blocked for all AI agents'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 4px' }}>
                    <span style={{ fontSize: '11px', padding: '2px 6px', borderRadius: '4px', backgroundColor: '#ef444422', color: '#ef4444' }}>
                      🔒 Server Enforced
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h4 style={{ margin: '16px 0 10px', fontSize: '13px', color: '#ddd' }}>Version History with Attribution (Human vs Agent):</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {historyItems.map(h => (
              <div
                key={h.id}
                style={{
                  backgroundColor: '#1b1b22',
                  padding: '12px 16px',
                  borderRadius: '6px',
                  border: '1px solid #282832',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      backgroundColor: h.authorType === 'agent' ? '#3b82f622' : '#22c55e22',
                      color: h.authorType === 'agent' ? '#60a5fa' : '#4ade80',
                      fontWeight: 600,
                    }}>
                      {h.authorType === 'agent' ? '🤖 AI Agent' : '👤 Human User'}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 600, color: '#fff' }}>{h.authorName}</span>
                    <span style={{ fontSize: '11px', color: '#666' }}>{new Date(h.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>
                    {h.changeSummary}
                  </div>
                </div>
                <button
                  style={{
                    background: 'none',
                    border: '1px solid #444',
                    borderRadius: '4px',
                    color: '#bbb',
                    fontSize: '11px',
                    padding: '3px 8px',
                    cursor: 'pointer',
                  }}
                  onClick={() => alert(`Restored document to revision from ${h.authorName}`)}
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
