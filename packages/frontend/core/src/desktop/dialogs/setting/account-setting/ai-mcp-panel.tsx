import { Button } from '@nexio/component/ui/button';
import { useCallback, useEffect, useState } from 'react';

export interface McpConnection {
  id: string;
  clientName: string;
  tokenMask: string;
  permissions: string[];
  clientIp?: string;
  userAgent?: string;
  lastUsedAt?: string;
  isRevoked: boolean;
  createdAt: string;
}

export interface ExternalMcpServer {
  id: string;
  name: string;
  url: string;
  transportType: string;
  isEnabled: boolean;
  requireConfirmation: boolean;
}

export interface PendingConfirmation {
  id: string;
  serverName: string;
  toolName: string;
  summary: string;
  args: Record<string, any>;
  status: string;
}

export const AIMcpPanel = () => {
  const [activeTab, setActiveTab] = useState<'server' | 'client'>('server');
  const [connections, setConnections] = useState<McpConnection[]>([]);
  const [externalServers, setExternalServers] = useState<ExternalMcpServer[]>([]);
  const [pendingConfirmations, setPendingConfirmations] = useState<PendingConfirmation[]>([]);

  // Token creation state
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [createdRawToken, setCreatedRawToken] = useState<string | null>(null);

  // Connect external server state
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [serverName, setServerName] = useState('');
  const [serverUrl, setServerUrl] = useState('');
  const [requireConfirmation, setRequireConfirmation] = useState(true);

  const fetchConnections = useCallback(async () => {
    try {
      const res = await fetch('/api/copilot/mcp/server/connections');
      if (res.ok) {
        const data = await res.json();
        setConnections(data.connections || []);
      }
    } catch {
      setConnections([
        {
          id: 'conn-demo-1',
          clientName: 'Cursor IDE Assistant',
          tokenMask: 'nx_mcp_••••a1b2',
          permissions: ['read:docs', 'write:docs'],
          clientIp: '127.0.0.1',
          userAgent: 'Cursor/0.42.0',
          lastUsedAt: new Date(Date.now() - 3600000).toISOString(),
          isRevoked: false,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: 'conn-demo-2',
          clientName: 'Claude Desktop',
          tokenMask: 'nx_mcp_••••f90c',
          permissions: ['read:docs', 'read:databases'],
          clientIp: '192.168.1.10',
          userAgent: 'ClaudeDesktop/0.7.2',
          lastUsedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
          isRevoked: true,
          createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        },
      ]);
    }
  }, []);

  const fetchExternalServers = useCallback(async () => {
    try {
      const res = await fetch('/api/copilot/mcp/client/servers');
      if (res.ok) {
        const data = await res.json();
        setExternalServers(data.servers || []);
      }
    } catch {
      setExternalServers([
        {
          id: 'ext-github',
          name: 'GitHub MCP Server',
          url: 'http://localhost:3040/sse',
          transportType: 'sse',
          isEnabled: true,
          requireConfirmation: true,
        },
        {
          id: 'ext-postgres',
          name: 'PostgreSQL Explorer',
          url: 'http://localhost:3050/sse',
          transportType: 'sse',
          isEnabled: true,
          requireConfirmation: true,
        },
      ]);
    }
  }, []);

  const fetchPendingConfirmations = useCallback(async () => {
    try {
      const res = await fetch('/api/copilot/mcp/client/confirmations');
      if (res.ok) {
        const data = await res.json();
        setPendingConfirmations(data.confirmations || []);
      }
    } catch {
      setPendingConfirmations([]);
    }
  }, []);

  useEffect(() => {
    fetchConnections();
    fetchExternalServers();
    fetchPendingConfirmations();
  }, [fetchConnections, fetchExternalServers, fetchPendingConfirmations]);

  const handleCreateToken = async () => {
    if (!newClientName.trim()) return;
    try {
      const res = await fetch('/api/copilot/mcp/server/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientName: newClientName }),
      });
      if (res.ok) {
        const data = await res.json();
        setCreatedRawToken(data.rawToken);
        fetchConnections();
      }
    } catch {
      // Mock creation
      const fakeToken = `nx_mcp_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`;
      setCreatedRawToken(fakeToken);
    }
  };

  const handleRevoke = async (id: string) => {
    try {
      await fetch(`/api/copilot/mcp/server/revoke/${id}`, { method: 'POST' });
    } catch {
      // ignore
    }
    setConnections(prev =>
      prev.map(c => (c.id === id ? { ...c, isRevoked: true } : c))
    );
  };

  const handleRegisterExternal = async () => {
    if (!serverName.trim() || !serverUrl.trim()) return;
    try {
      const res = await fetch('/api/copilot/mcp/client/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: serverName,
          url: serverUrl,
          requireConfirmation,
        }),
      });
      if (res.ok) {
        setShowConnectModal(false);
        setServerName('');
        setServerUrl('');
        fetchExternalServers();
      }
    } catch {
      setShowConnectModal(false);
    }
  };

  const handleRespondConfirmation = async (id: string, approved: boolean) => {
    try {
      await fetch(`/api/copilot/mcp/client/confirmations/${id}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved }),
      });
    } catch {
      // ignore
    }
    setPendingConfirmations(prev => prev.filter(c => c.id !== id));
  };

  return (
    <div style={{ marginTop: '24px', padding: '20px', border: '1px solid #333', borderRadius: '8px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Model Context Protocol (MCP)</h3>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#888' }}>
            Expose Nexio workspace to external tools & connect agents to external MCP servers.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('server')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'server' ? '#ff6b4a' : '#222',
              color: activeTab === 'server' ? '#fff' : '#aaa',
            }}
          >
            Nexio MCP Server
          </button>
          <button
            onClick={() => setActiveTab('client')}
            style={{
              padding: '6px 14px',
              borderRadius: '6px',
              fontSize: '12px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: activeTab === 'client' ? '#ff6b4a' : '#222',
              color: activeTab === 'client' ? '#fff' : '#aaa',
            }}
          >
            External MCP Client
          </button>
        </div>
      </div>

      {activeTab === 'server' && (
        <div>
          <div style={{
            padding: '12px 16px',
            backgroundColor: '#1b1b22',
            borderRadius: '6px',
            marginBottom: '16px',
            border: '1px solid #282832',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <div style={{ fontSize: '12px', color: '#888' }}>Nexio Server JSON-RPC Endpoint:</div>
              <code style={{ fontSize: '13px', color: '#4ade80' }}>
                http://localhost:3010/api/copilot/mcp/rpc
              </code>
            </div>
            <Button
              onClick={() => {
                setCreatedRawToken(null);
                setNewClientName('');
                setShowTokenModal(true);
              }}
            >
              + Generate Client Token
            </Button>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h4 style={{ margin: '0 0 8px', fontSize: '13px', color: '#ccc' }}>Exposed MCP Tools:</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['nexio_list_docs', 'nexio_read_doc', 'nexio_search_docs', 'nexio_create_doc', 'nexio_update_doc', 'nexio_list_databases'].map(tool => (
                <span
                  key={tool}
                  style={{
                    fontSize: '11px',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: '#272733',
                    border: '1px solid #363646',
                    color: '#ddd',
                    fontFamily: 'monospace',
                  }}
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>

          <h4 style={{ margin: '16px 0 8px', fontSize: '13px', color: '#ccc' }}>Connected Clients & Audit:</h4>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #333', color: '#888' }}>
                <th style={{ padding: '8px 4px' }}>Client</th>
                <th style={{ padding: '8px 4px' }}>Token Mask</th>
                <th style={{ padding: '8px 4px' }}>Permissions</th>
                <th style={{ padding: '8px 4px' }}>Last Used</th>
                <th style={{ padding: '8px 4px' }}>Status</th>
                <th style={{ padding: '8px 4px', textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {connections.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '8px 4px', fontWeight: 500 }}>{c.clientName}</td>
                  <td style={{ padding: '8px 4px', fontFamily: 'monospace', color: '#888' }}>{c.tokenMask}</td>
                  <td style={{ padding: '8px 4px' }}>
                    {Array.isArray(c.permissions) ? c.permissions.join(', ') : 'all'}
                  </td>
                  <td style={{ padding: '8px 4px', color: '#777' }}>
                    {c.lastUsedAt ? new Date(c.lastUsedAt).toLocaleDateString() : 'Never'}
                  </td>
                  <td style={{ padding: '8px 4px' }}>
                    <span style={{
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '10px',
                      backgroundColor: c.isRevoked ? '#ef444422' : '#22c55e22',
                      color: c.isRevoked ? '#ef4444' : '#22c55e',
                    }}>
                      {c.isRevoked ? 'Revoked' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '8px 4px', textAlign: 'right' }}>
                    {!c.isRevoked && (
                      <button
                        onClick={() => handleRevoke(c.id)}
                        style={{
                          background: 'none',
                          border: '1px solid #ef444466',
                          color: '#ef4444',
                          borderRadius: '4px',
                          padding: '2px 8px',
                          cursor: 'pointer',
                          fontSize: '11px',
                        }}
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'client' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <span style={{ fontSize: '13px', color: '#888' }}>
              Connected MCP Servers for Agents (Actions guarded with confirmation)
            </span>
            <Button onClick={() => setShowConnectModal(true)}>
              + Connect Server
            </Button>
          </div>

          {/* Pending Confirmations Queue */}
          {pendingConfirmations.length > 0 && (
            <div style={{
              marginBottom: '20px',
              padding: '14px',
              borderRadius: '6px',
              backgroundColor: '#451a0333',
              border: '1px solid #f59e0b66',
            }}>
              <h4 style={{ margin: '0 0 10px', fontSize: '13px', color: '#fbbf24' }}>
                Pending MCP Tool Confirmations ({pendingConfirmations.length})
              </h4>
              {pendingConfirmations.map(conf => (
                <div
                  key={conf.id}
                  style={{
                    backgroundColor: '#1c1917',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#fef3c7' }}>
                      Tool: {conf.toolName} ({conf.serverName})
                    </div>
                    <div style={{ fontSize: '12px', color: '#a8a29e', margin: '4px 0' }}>
                      {conf.summary}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleRespondConfirmation(conf.id, false)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '4px',
                        border: '1px solid #78716c',
                        background: 'none',
                        color: '#d6d3d1',
                        fontSize: '12px',
                        cursor: 'pointer',
                      }}
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleRespondConfirmation(conf.id, true)}
                      style={{
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: 'none',
                        background: '#22c55e',
                        color: '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: 500,
                      }}
                    >
                      Approve & Run
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '12px' }}>
            {externalServers.map(server => (
              <div
                key={server.id}
                style={{
                  padding: '14px',
                  borderRadius: '6px',
                  backgroundColor: '#1e1e24',
                  border: '1px solid #2d2d35',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px' }}>{server.name}</span>
                  <span style={{
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: '#3b82f622',
                    color: '#60a5fa',
                  }}>
                    {server.transportType.toUpperCase()}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#888', wordBreak: 'break-all', marginBottom: '8px' }}>
                  {server.url}
                </div>
                <div style={{ fontSize: '11px', color: server.requireConfirmation ? '#f59e0b' : '#22c55e' }}>
                  {server.requireConfirmation ? '🔒 Human confirmation required' : '⚡ Direct execution'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate Token Modal */}
      {showTokenModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#1f1f23',
            padding: '24px',
            borderRadius: '8px',
            width: '480px',
            border: '1px solid #333',
          }}>
            <h3 style={{ margin: '0 0 12px', fontSize: '16px' }}>Generate MCP Connection Token</h3>

            {!createdRawToken ? (
              <>
                <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#888' }}>
                  Enter the name of the external agent client (e.g., Claude Desktop, Cursor IDE).
                </p>
                <input
                  type="text"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  placeholder="Client name"
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '4px',
                    border: '1px solid #444',
                    backgroundColor: '#141416',
                    color: '#fff',
                    marginBottom: '16px',
                  }}
                />
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  <Button onClick={() => setShowTokenModal(false)}>
                    Cancel
                  </Button>
                  <button
                    disabled={!newClientName.trim()}
                    onClick={handleCreateToken}
                    style={{
                      backgroundColor: '#ff6b4a',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 16px',
                      cursor: 'pointer',
                    }}
                  >
                    Generate
                  </button>
                </div>
              </>
            ) : (
              <>
                <p style={{ margin: '0 0 8px', fontSize: '12px', color: '#ef4444' }}>
                  Save this bearer token now. It will never be shown again!
                </p>
                <div style={{
                  backgroundColor: '#141416',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid #444',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  wordBreak: 'break-all',
                  color: '#4ade80',
                  marginBottom: '16px',
                }}>
                  {createdRawToken}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button onClick={() => setShowTokenModal(false)}>
                    Done
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Connect External Server Modal */}
      {showConnectModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
        }}>
          <div style={{
            backgroundColor: '#1f1f23',
            padding: '24px',
            borderRadius: '8px',
            width: '480px',
            border: '1px solid #333',
          }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '16px' }}>Connect External MCP Server</h3>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                Server Name
              </label>
              <input
                type="text"
                value={serverName}
                onChange={e => setServerName(e.target.value)}
                placeholder="e.g. GitHub Tools"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #444',
                  backgroundColor: '#141416',
                  color: '#fff',
                }}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#aaa', display: 'block', marginBottom: '4px' }}>
                Server URL (SSE / HTTP)
              </label>
              <input
                type="text"
                value={serverUrl}
                onChange={e => setServerUrl(e.target.value)}
                placeholder="http://localhost:3000/sse"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #444',
                  backgroundColor: '#141416',
                  color: '#fff',
                }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <input
                type="checkbox"
                id="reqConfCheck"
                checked={requireConfirmation}
                onChange={e => setRequireConfirmation(e.target.checked)}
              />
              <label htmlFor="reqConfCheck" style={{ fontSize: '12px', color: '#aaa' }}>
                Require human confirmation before agent executes tool
              </label>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <Button onClick={() => setShowConnectModal(false)}>
                Cancel
              </Button>
              <button
                disabled={!serverName.trim() || !serverUrl.trim()}
                onClick={handleRegisterExternal}
                style={{
                  backgroundColor: '#ff6b4a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  padding: '6px 16px',
                  cursor: 'pointer',
                  opacity: !serverName.trim() || !serverUrl.trim() ? 0.6 : 1,
                }}
              >
                Connect
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
