import { useCallback, useEffect, useState } from 'react';
import { DocCollabService } from './doc-collab-service';
import type { DocComment, DocLinkedIssue, DocVersionSnapshot } from './types';

interface DocCollaborationPanelProps {
  workspaceId: string;
  docId: string;
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = 'issues' | 'versions' | 'comments';

export const DocCollaborationPanel = ({
  workspaceId,
  docId,
  isOpen,
  onClose,
}: DocCollaborationPanelProps) => {
  const [activeTab, setActiveTab] = useState<TabKey>('issues');
  const [linkedIssues, setLinkedIssues] = useState<DocLinkedIssue[]>([]);
  const [versions, setVersions] = useState<DocVersionSnapshot[]>([]);
  const [comments, setComments] = useState<DocComment[]>([]);
  const [newCommentText, setNewCommentText] = useState('');
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});

  const loadData = useCallback(async () => {
    const [issues, vers, comms] = await Promise.all([
      DocCollabService.getLinkedIssues(workspaceId, docId),
      DocCollabService.getVersions(workspaceId, docId),
      DocCollabService.getComments(workspaceId, docId),
    ]);
    setLinkedIssues(issues);
    setVersions(vers);
    setComments(comms);
  }, [workspaceId, docId]);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, loadData]);

  const handleLinkIssue = async () => {
    const issueId = prompt('Enter Tracker Issue ID (e.g. NEX-103):');
    if (!issueId) return;
    const ok = await DocCollabService.linkIssue(workspaceId, docId, issueId.trim().toUpperCase());
    if (ok) {
      loadData();
    }
  };

  const handleUnlinkIssue = async (issueId: string) => {
    const ok = await DocCollabService.unlinkIssue(workspaceId, docId, issueId);
    if (ok) {
      setLinkedIssues(prev => prev.filter(i => i.issueId !== issueId));
    }
  };

  const handleCreateSnapshot = async () => {
    const title = prompt('Snapshot Title / Description:', 'Milestone Revision');
    if (!title) return;
    const summary = prompt('Snapshot Summary:', 'Manual save point created in collaboration panel');
    const created = await DocCollabService.createVersion(workspaceId, docId, title, summary || '');
    if (created) {
      setVersions(prev => [created, ...prev]);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm('Are you sure you want to restore this version snapshot?')) return;
    const ok = await DocCollabService.restoreVersion(workspaceId, docId, versionId);
    if (ok) {
      alert('Version restored successfully!');
      loadData();
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    const created = await DocCollabService.createComment(workspaceId, docId, newCommentText.trim());
    if (created) {
      setComments(prev => [...prev, created]);
      setNewCommentText('');
    }
  };

  const handleAddReply = async (commentId: string) => {
    const text = replyTextMap[commentId];
    if (!text || !text.trim()) return;
    const updated = await DocCollabService.replyComment(workspaceId, docId, commentId, text.trim());
    if (updated) {
      setComments(prev => prev.map(c => (c.id === commentId ? updated : c)));
      setReplyTextMap(prev => ({ ...prev, [commentId]: '' }));
    }
  };

  const handleToggleResolve = async (commentId: string) => {
    const updated = await DocCollabService.resolveComment(workspaceId, docId, commentId);
    if (updated) {
      setComments(prev => prev.map(c => (c.id === commentId ? updated : c)));
    }
  };

  if (!isOpen) return null;

  return (
    <aside
      style={{
        width: 360,
        height: '100%',
        backgroundColor: 'var(--affine-background-primary-color, #18181b)',
        borderLeft: '1px solid var(--affine-border-color, rgba(255,255,255,0.08))',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 40,
        flexShrink: 0,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '14px 18px',
          borderBottom: '1px solid var(--affine-border-color, rgba(255,255,255,0.08))',
        }}
      >
        <span style={{ fontSize: 14, fontWeight: 700, color: '#ffffff' }}>
          Document Collaboration
        </span>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#a1a1aa',
            fontSize: 16,
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      </div>

      {/* Tabs */}
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
            padding: '10px 0',
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
            padding: '10px 0',
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
            padding: '10px 0',
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

      {/* Tab Contents */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {/* Linked Issues Tab */}
        {activeTab === 'issues' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>
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
              <div style={{ color: '#71717a', fontSize: 13, textAlign: 'center', marginTop: 24 }}>
                No Tracker issues linked to this document yet. Click + Link Issue to connect tasks.
              </div>
            ) : (
              linkedIssues.map(iss => (
                <div
                  key={iss.issueId}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: 8,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#60a5fa' }}>
                      {iss.issueId}
                    </span>
                    <button
                      onClick={() => handleUnlinkIssue(iss.issueId)}
                      title="Unlink issue"
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
                  <div style={{ fontSize: 13, color: '#f4f4f5', fontWeight: 500 }}>
                    {iss.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: '2px 6px',
                        borderRadius: 4,
                        backgroundColor: 'rgba(255,255,255,0.08)',
                        color: '#a1a1aa',
                      }}
                    >
                      {iss.status.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: 11, color: '#71717a' }}>
                      Assignee: {iss.assignee}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Version History Tab */}
        {activeTab === 'versions' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#a1a1aa' }}>
                REVISION TIMELINE
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
                  padding: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#ffffff' }}>
                    Version {ver.versionNumber}: {ver.title}
                  </span>
                  <button
                    onClick={() => handleRestore(ver.id)}
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#60a5fa',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 4,
                      cursor: 'pointer',
                    }}
                  >
                    Restore
                  </button>
                </div>
                <div style={{ fontSize: 12, color: '#a1a1aa', marginBottom: 6 }}>
                  {ver.summary}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 11, color: '#71717a' }}>
                  <span>By {ver.author}</span>
                  <span>•</span>
                  <span>{new Date(ver.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>•</span>
                  <span>{(ver.size / 1024).toFixed(1)} KB</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Comments Tab */}
        {activeTab === 'comments' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* New Comment Input */}
            <form onSubmit={handleAddComment}>
              <textarea
                rows={2}
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                placeholder="Leave an inline comment or feedback..."
                style={{
                  width: '100%',
                  padding: '8px 10px',
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 6 }}>
                <button
                  type="submit"
                  disabled={!newCommentText.trim()}
                  style={{
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: 4,
                    padding: '4px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: newCommentText.trim() ? 'pointer' : 'not-allowed',
                  }}
                >
                  Comment
                </button>
              </div>
            </form>

            {/* Comment Threads */}
            {comments.map(comm => (
              <div
                key={comm.id}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 8,
                  padding: 12,
                  opacity: comm.resolved ? 0.6 : 1,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#f4f4f5' }}>
                    {comm.author}
                  </span>
                  <button
                    onClick={() => handleToggleResolve(comm.id)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: comm.resolved ? '#22c55e' : '#71717a',
                      fontSize: 11,
                      cursor: 'pointer',
                    }}
                  >
                    {comm.resolved ? '✓ Resolved' : 'Mark Resolved'}
                  </button>
                </div>
                <div style={{ fontSize: 13, color: '#e4e4e7', marginBottom: 8 }}>
                  {comm.content}
                </div>

                {/* Replies */}
                {comm.replies && comm.replies.length > 0 && (
                  <div
                    style={{
                      borderLeft: '2px solid rgba(255,255,255,0.1)',
                      paddingLeft: 8,
                      marginBottom: 8,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    {comm.replies.map(rep => (
                      <div key={rep.id} style={{ fontSize: 12 }}>
                        <span style={{ fontWeight: 600, color: '#a1a1aa' }}>{rep.author}: </span>
                        <span style={{ color: '#e4e4e7' }}>{rep.content}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Reply Input */}
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <input
                    type="text"
                    value={replyTextMap[comm.id] || ''}
                    onChange={e => setReplyTextMap({ ...replyTextMap, [comm.id]: e.target.value })}
                    placeholder="Reply..."
                    style={{
                      flex: 1,
                      padding: '4px 8px',
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
                      padding: '4px 8px',
                      backgroundColor: '#27272a',
                      border: '1px solid rgba(255,255,255,0.1)',
                      color: '#ffffff',
                      borderRadius: 4,
                      fontSize: 11,
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
    </aside>
  );
};
