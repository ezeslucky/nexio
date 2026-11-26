import { useCallback, useEffect, useState } from 'react';
import { DocCollabService } from './doc-collab-service';
import type { DocComment, DocLinkedIssue, DocVersionSnapshot } from './types';

interface DocCollabTabProps {
  workspaceId: string;
  docId: string;
}

type TabType = 'issues' | 'versions' | 'comments';

export const DocCollabTab = ({ workspaceId, docId }: DocCollabTabProps) => {
  const [activeTab, setActiveTab] = useState<TabType>('issues');
  const [linkedIssues, setLinkedIssues] = useState<DocLinkedIssue[]>([]);
  const [versions, setVersions] = useState<DocVersionSnapshot[]>([]);
  const [comments, setComments] = useState<DocComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyMap, setReplyMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [issues, vers, comms] = await Promise.all([
      DocCollabService.getLinkedIssues(workspaceId, docId),
      DocCollabService.getVersions(workspaceId, docId),
      DocCollabService.getComments(workspaceId, docId),
    ]);
    setLinkedIssues(issues);
    setVersions(vers);
    setComments(comms);
    setLoading(false);
  }, [workspaceId, docId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleLinkIssue = async () => {
    const issueId = prompt('Enter Tracker Issue ID to link (e.g. NEX-101):');
    if (!issueId) return;
    const ok = await DocCollabService.linkIssue(workspaceId, docId, issueId.trim().toUpperCase());
    if (ok) {
      loadAll();
    }
  };

  const handleUnlinkIssue = async (issueId: string) => {
    const ok = await DocCollabService.unlinkIssue(workspaceId, docId, issueId);
    if (ok) {
      setLinkedIssues(prev => prev.filter(i => i.issueId !== issueId));
    }
  };

  const handleCreateSnapshot = async () => {
    const title = prompt('Snapshot Title / Revision Tag:', 'Milestone Release');
    if (!title) return;
    const summary = prompt('Revision Summary:', 'Manual save point created in collaboration panel');
    const created = await DocCollabService.createVersion(workspaceId, docId, title, summary || '');
    if (created) {
      setVersions(prev => [created, ...prev]);
    }
  };

  const handleRestoreSnapshot = async (versionId: string) => {
    if (!confirm('Restore this document snapshot? Current edits will be preserved in a new revision.')) return;
    const ok = await DocCollabService.restoreVersion(workspaceId, docId, versionId);
    if (ok) {
      alert('Snapshot restored successfully!');
      loadAll();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    const created = await DocCollabService.createComment(workspaceId, docId, newComment.trim());
    if (created) {
      setComments(prev => [...prev, created]);
      setNewComment('');
    }
  };

  const handleAddReply = async (commentId: string) => {
    const text = replyMap[commentId];
    if (!text || !text.trim()) return;
    const updated = await DocCollabService.replyComment(workspaceId, docId, commentId, text.trim());
    if (updated) {
      setComments(prev => prev.map(c => (c.id === commentId ? updated : c)));
      setReplyMap(prev => ({ ...prev, [commentId]: '' }));
    }
  };

  const handleToggleResolve = async (commentId: string) => {
    const updated = await DocCollabService.resolveComment(workspaceId, docId, commentId);
    if (updated) {
      setComments(prev => prev.map(c => (c.id === commentId ? updated : c)));
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        backgroundColor: 'var(--affine-background-primary-color, #18181b)',
        color: 'var(--affine-text-primary-color, #ffffff)',
      }}
    >
      {/* Tab Switcher */}
      <div
        style={{
          display: 'flex',
          borderBottom: '1px solid var(--affine-border-color, rgba(255,255,255,0.08))',
          backgroundColor: 'rgba(255,255,255,0.02)',
        }}
      >
        <button
          onClick={() => setActiveTab('issues')}
          style={{
            flex: 1,
            padding: '10px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'issues' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'issues' ? '#60a5fa' : '#a1a1aa',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Issues ({linkedIssues.length})
        </button>
        <button
          onClick={() => setActiveTab('versions')}
          style={{
            flex: 1,
            padding: '10px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'versions' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'versions' ? '#60a5fa' : '#a1a1aa',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          History ({versions.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          style={{
            flex: 1,
            padding: '10px 4px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'comments' ? '2px solid #3b82f6' : 'none',
            color: activeTab === 'comments' ? '#60a5fa' : '#a1a1aa',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Comments ({comments.filter(c => !c.resolved).length})
        </button>
      </div>

      {/* Body Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px' }}>
        {loading ? (
          <div style={{ color: '#71717a', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
            Loading collaboration data...
          </div>
        ) : activeTab === 'issues' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.04em' }}>
                LINKED TRACKER ISSUES
              </span>
              <button
                onClick={handleLinkIssue}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Link Issue
              </button>
            </div>

            {linkedIssues.length === 0 ? (
              <div style={{ color: '#71717a', fontSize: 13, textAlign: 'center', marginTop: 20 }}>
                No issues linked to this document yet. Click + Link Issue to connect tasks.
              </div>
            ) : (
              linkedIssues.map(iss => (
                <div
                  key={iss.issueId}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>
                      {iss.issueId}
                    </span>
                    <button
                      onClick={() => handleUnlinkIssue(iss.issueId)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#71717a',
                        cursor: 'pointer',
                        fontSize: 12,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ fontSize: 13, color: '#f4f4f5', fontWeight: 500, marginBottom: 6 }}>
                    {iss.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span
                      style={{
                        fontSize: 10,
                        padding: '1px 5px',
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: '#a1a1aa',
                      }}
                    >
                      {iss.status.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: 11, color: '#71717a' }}>
                      {iss.assignee}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : activeTab === 'versions' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#a1a1aa', letterSpacing: '0.04em' }}>
                VERSION SNAPSHOTS
              </span>
              <button
                onClick={handleCreateSnapshot}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#3b82f6',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + Save Snapshot
              </button>
            </div>

            {versions.map(ver => (
              <div
                key={ver.id}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>
                    v{ver.versionNumber}: {ver.title}
                  </span>
                  <button
                    onClick={() => handleRestoreSnapshot(ver.id)}
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#60a5fa',
                      fontSize: 10,
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Restore
                  </button>
                </div>
                <div style={{ fontSize: 11, color: '#a1a1aa', marginBottom: 4 }}>
                  {ver.summary}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: '#71717a' }}>
                  <span>{ver.author}</span>
                  <span>•</span>
                  <span>{new Date(ver.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>•</span>
                  <span>{(ver.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <form onSubmit={handleAddComment}>
              <textarea
                rows={2}
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                placeholder="Add a comment or discussion..."
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 6,
                  border: '1px solid rgba(255,255,255,0.15)',
                  backgroundColor: '#121214',
                  color: '#ffffff',
                  fontSize: 12,
                  resize: 'none',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 4,
                    padding: '3px 10px',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Post
                </button>
              </div>
            </form>

            {comments.map(comm => (
              <div
                key={comm.id}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 10,
                  opacity: comm.resolved ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#f4f4f5' }}>
                    {comm.author}
                  </span>
                  <button
                    onClick={() => handleToggleResolve(comm.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: comm.resolved ? '#22c55e' : '#71717a',
                      fontSize: 10,
                      cursor: 'pointer',
                    }}
                  >
                    {comm.resolved ? '✓ Resolved' : 'Mark Resolved'}
                  </button>
                </div>
                <div style={{ fontSize: 12, color: '#e4e4e7', marginBottom: 6 }}>
                  {comm.content}
                </div>

                {comm.replies && comm.replies.length > 0 && (
                  <div
                    style={{
                      borderLeft: '2px solid rgba(255,255,255,0.1)',
                      paddingLeft: 6,
                      marginBottom: 6,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4,
                    }}
                  >
                    {comm.replies.map(rep => (
                      <div key={rep.id} style={{ fontSize: 11 }}>
                        <span style={{ fontWeight: 600, color: '#a1a1aa' }}>{rep.author}: </span>
                        <span style={{ color: '#e4e4e7' }}>{rep.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                  <input
                    type="text"
                    value={replyMap[comm.id] || ''}
                    onChange={e => setReplyMap({ ...replyMap, [comm.id]: e.target.value })}
                    placeholder="Reply..."
                    style={{
                      flex: 1,
                      padding: '3px 6px',
                      borderRadius: 4,
                      border: '1px solid rgba(255,255,255,0.1)',
                      backgroundColor: '#121214',
                      color: '#ffffff',
                      fontSize: 11,
                      outline: 'none',
                    }}
                  />
                  <button
                    onClick={() => handleAddReply(comm.id)}
                    style={{
                      padding: '3px 6px',
                      backgroundColor: '#27272a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      borderRadius: 4,
                      fontSize: 10,
                      cursor: 'pointer',
                    }}
                  >
                    Reply
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
