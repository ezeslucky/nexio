import { useState } from 'react';
import type { ChatChannel, DirectMessageConv } from './types';

interface ChannelSidebarProps {
  channels: ChatChannel[];
  dms: DirectMessageConv[];
  activeChannelId: string;
  activeDMId: string;
  onSelectChannel: (channelId: string) => void;
  onSelectDM: (dmId: string) => void;
  onCreateChannel: (channel: { name: string; description: string; topic: string; isPrivate: boolean }) => void;
}

export const ChannelSidebar = ({
  channels,
  dms,
  activeChannelId,
  activeDMId,
  onSelectChannel,
  onSelectDM,
  onCreateChannel,
}: ChannelSidebarProps) => {
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [newChanName, setNewChanName] = useState('');
  const [newChanDesc, setNewChanDesc] = useState('');
  const [newChanTopic, setNewChanTopic] = useState('');
  const [newChanPrivate, setNewChanPrivate] = useState(false);

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const filteredDMs = dms.filter(d =>
    d.members.some(m => m.toLowerCase().includes(search.toLowerCase()))
  );

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChanName.trim()) return;
    onCreateChannel({
      name: newChanName.trim().toLowerCase().replace(/\s+/g, '-'),
      description: newChanDesc.trim(),
      topic: newChanTopic.trim(),
      isPrivate: newChanPrivate,
    });
    setNewChanName('');
    setNewChanDesc('');
    setNewChanTopic('');
    setNewChanPrivate(false);
    setShowModal(false);
  };

  return (
    <aside
      style={{
        width: 260,
        height: '100%',
        backgroundColor: 'var(--affine-background-secondary-color, #1a1a1c)',
        borderRight: '1px solid var(--affine-border-color, rgba(255,255,255,0.08))',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
      }}
    >
      {/* Header & Quick Filter */}
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--affine-border-color, rgba(255,255,255,0.06))' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--affine-text-secondary-color, #8e8d91)' }}>
            CHANNELS
          </span>
          <button
            onClick={() => setShowModal(true)}
            title="Create Channel"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--affine-primary-color, #3b82f6)',
              fontSize: 18,
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: 4,
            }}
          >
            +
          </button>
        </div>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter channels or DMs..."
          style={{
            width: '100%',
            padding: '6px 10px',
            fontSize: 12,
            borderRadius: 6,
            border: '1px solid var(--affine-border-color, rgba(255,255,255,0.1))',
            backgroundColor: 'var(--affine-background-primary-color, #121214)',
            color: 'var(--affine-text-primary-color, #ffffff)',
            outline: 'none',
            boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Lists */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '10px 8px' }}>
        {/* Public / Private Channels */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#71717a', padding: '4px 8px', letterSpacing: '0.05em' }}>
            TEAM CHANNELS
          </div>
          {filteredChannels.map(ch => {
            const isActive = activeChannelId === ch.id && !activeDMId;
            return (
              <div
                key={ch.id}
                onClick={() => onSelectChannel(ch.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  marginBottom: 2,
                  backgroundColor: isActive
                    ? 'var(--affine-hover-color, rgba(255, 255, 255, 0.08))'
                    : 'transparent',
                  color: isActive
                    ? 'var(--affine-primary-color, #60a5fa)'
                    : 'var(--affine-text-primary-color, #e4e4e7)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13,
                  transition: 'background 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, overflow: 'hidden' }}>
                  <span style={{ opacity: 0.6, fontSize: 13, flexShrink: 0 }}>
                    {ch.isPrivate ? '🔒' : '#'}
                  </span>
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {ch.name}
                  </span>
                </div>
                {ch.unreadCount > 0 && (
                  <span
                    style={{
                      backgroundColor: 'var(--affine-primary-color, #3b82f6)',
                      color: '#ffffff',
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 10,
                      padding: '1px 6px',
                      minWidth: 16,
                      textAlign: 'center',
                    }}
                  >
                    {ch.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Direct Messages */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 600, color: '#71717a', padding: '4px 8px', letterSpacing: '0.05em' }}>
            DIRECT MESSAGES
          </div>
          {filteredDMs.map(dm => {
            const isActive = activeDMId === dm.id;
            const otherMember = dm.members.find(m => m !== 'Aurobindo Patra') || dm.members[0] || 'User';
            return (
              <div
                key={dm.id}
                onClick={() => onSelectDM(dm.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '7px 10px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  marginBottom: 2,
                  backgroundColor: isActive
                    ? 'var(--affine-hover-color, rgba(255, 255, 255, 0.08))'
                    : 'transparent',
                  color: isActive
                    ? 'var(--affine-primary-color, #60a5fa)'
                    : 'var(--affine-text-primary-color, #e4e4e7)',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: 13,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <div
                      style={{
                        width: 20,
                        height: 20,
                        borderRadius: '50%',
                        backgroundColor: '#3f3f46',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 10,
                        fontWeight: 700,
                        color: '#ffffff',
                      }}
                    >
                      {otherMember.charAt(0).toUpperCase()}
                    </div>
                    <div
                      style={{
                        position: 'absolute',
                        bottom: -1,
                        right: -1,
                        width: 7,
                        height: 7,
                        borderRadius: '50%',
                        backgroundColor: '#22c55e',
                        border: '1.5px solid #1a1a1c',
                      }}
                    />
                  </div>
                  <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                    {otherMember}
                  </span>
                </div>
                {dm.unreadCount > 0 && (
                  <span
                    style={{
                      backgroundColor: 'var(--affine-primary-color, #3b82f6)',
                      color: '#ffffff',
                      fontSize: 10,
                      fontWeight: 700,
                      borderRadius: 10,
                      padding: '1px 6px',
                    }}
                  >
                    {dm.unreadCount}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Channel Modal */}
      {showModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--affine-background-primary-color, #18181b)',
              border: '1px solid var(--affine-border-color, rgba(255,255,255,0.12))',
              borderRadius: 12,
              padding: 22,
              width: 380,
              boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ margin: '0 0 14px', fontSize: 16, color: '#ffffff' }}>Create New Channel</h3>
            <form onSubmit={handleCreateSubmit}>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#a1a1aa', marginBottom: 4 }}>Channel Name</label>
                <input
                  type="text"
                  placeholder="e.g. project-apollo"
                  value={newChanName}
                  onChange={e => setNewChanName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: 13,
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.15)',
                    backgroundColor: '#121214',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 12 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#a1a1aa', marginBottom: 4 }}>Description</label>
                <input
                  type="text"
                  placeholder="What is this channel about?"
                  value={newChanDesc}
                  onChange={e => setNewChanDesc(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: 13,
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.15)',
                    backgroundColor: '#121214',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#a1a1aa', marginBottom: 4 }}>Channel Topic</label>
                <input
                  type="text"
                  placeholder="Topic of current discussion"
                  value={newChanTopic}
                  onChange={e => setNewChanTopic(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    fontSize: 13,
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.15)',
                    backgroundColor: '#121214',
                    color: '#ffffff',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <input
                  type="checkbox"
                  id="private-chan"
                  checked={newChanPrivate}
                  onChange={e => setNewChanPrivate(e.target.checked)}
                />
                <label htmlFor="private-chan" style={{ fontSize: 13, color: '#e4e4e7', cursor: 'pointer' }}>
                  Make private (invite-only)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 6,
                    border: '1px solid rgba(255,255,255,0.15)',
                    background: 'transparent',
                    color: '#a1a1aa',
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '6px 16px',
                    borderRadius: 6,
                    border: 'none',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    fontWeight: 600,
                    cursor: 'pointer',
                    fontSize: 13,
                  }}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
};
