import type { OfficeParticipant, OfficeRoom } from './types';

interface ActiveRoomCallProps {
  room: OfficeRoom;
  currentUserId: string;
  onLeave: () => void;
  onToggleMic: (muted: boolean) => void;
  onToggleVideo: (videoOn: boolean) => void;
  onToggleScreenShare: (sharing: boolean) => void;
}

export const ActiveRoomCall = ({
  room,
  currentUserId,
  onLeave,
  onToggleMic,
  onToggleVideo,
  onToggleScreenShare,
}: ActiveRoomCallProps) => {
  const currentParticipant = room.participants.find(
    p => p.userId === currentUserId
  );
  const isMuted = currentParticipant?.isMuted ?? false;
  const isVideoOn = currentParticipant?.isVideoOn ?? true;
  const isScreenSharing = currentParticipant?.isScreenSharing ?? false;

  const screenSharingParticipant = room.participants.find(
    p => p.isScreenSharing
  );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 14,
        background: 'var(--affine-background-secondary-color, #18181b)',
        border: '1px solid var(--affine-primary-color, #3b82f6)',
        boxShadow: '0 8px 30px rgba(59, 130, 246, 0.15)',
        marginBottom: 28,
        overflow: 'hidden',
      }}
    >
      {/* Call Header Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '14px 20px',
          background: 'rgba(59, 130, 246, 0.08)',
          borderBottom: '1px solid var(--affine-border-color, #27272a)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 10px #10b981',
            }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 700 }}>{room.name}</span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: '#60a5fa',
                }}
              >
                {room.type.replace('_', ' ')}
              </span>
            </div>
            <span style={{ fontSize: 12, color: 'var(--affine-text-secondary-color)' }}>
              Connected with {room.participants.length} participant
              {room.participants.length === 1 ? '' : 's'} • P2P WebRTC Active
            </span>
          </div>
        </div>

        {/* Leave Call Button */}
        <button
          type="button"
          onClick={onLeave}
          style={{
            padding: '7px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#ef4444',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>✕ Leave Call</span>
        </button>
      </div>

      {/* Screen Share Stage (if anyone is sharing) */}
      {screenSharingParticipant && (
        <div
          style={{
            padding: '16px 20px',
            background: '#09090b',
            borderBottom: '1px solid var(--affine-border-color, #27272a)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: 180,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 10,
              color: '#a78bfa',
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            <span>💻</span>
            <span>{screenSharingParticipant.userName} is presenting their screen</span>
          </div>
          <div
            style={{
              width: '90%',
              maxWidth: 720,
              height: 200,
              borderRadius: 8,
              border: '1px dashed #4c1d95',
              background: 'linear-gradient(135deg, rgba(76,29,149,0.2), rgba(30,27,75,0.4))',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--affine-text-secondary-color)',
              fontSize: 13,
            }}
          >
            <span style={{ fontSize: 32, marginBottom: 8 }}>🖥️</span>
            <span>Active Screen Presentation Stream</span>
            <span style={{ fontSize: 11, opacity: 0.7, marginTop: 4 }}>
              Resolution: 1920x1080 • 60 FPS • Encrypted WebRTC Media Track
            </span>
          </div>
        </div>
      )}

      {/* Participants Video / Tile Stage */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            room.participants.length <= 2
              ? 'repeat(auto-fit, minmax(260px, 1fr))'
              : 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: 14,
          padding: 18,
          background: 'var(--affine-background-primary-color, #09090b)',
        }}
      >
        {room.participants.map(p => {
          const isSelf = p.userId === currentUserId;
          return (
            <div
              key={p.userId}
              style={{
                position: 'relative',
                height: 160,
                borderRadius: 12,
                overflow: 'hidden',
                background: p.isVideoOn
                  ? 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
                  : 'var(--affine-background-secondary-color, #18181b)',
                border: !p.isMuted
                  ? '2px solid #10b981'
                  : '1px solid var(--affine-border-color, #27272a)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: !p.isMuted
                  ? '0 0 16px rgba(16, 185, 129, 0.25)'
                  : 'none',
              }}
            >
              {/* Avatar or Video Silhouette */}
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 22,
                  fontWeight: 700,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                  marginBottom: 8,
                }}
              >
                {p.userName.slice(0, 1).toUpperCase()}
              </div>

              {/* Speaking Audio Wave Animation */}
              {!p.isMuted && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 3,
                    height: 14,
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{
                      width: 3,
                      height: 10,
                      background: '#10b981',
                      borderRadius: 2,
                      animation: 'pulse 0.8s infinite alternate',
                    }}
                  />
                  <span
                    style={{
                      width: 3,
                      height: 14,
                      background: '#10b981',
                      borderRadius: 2,
                      animation: 'pulse 0.6s infinite alternate',
                    }}
                  />
                  <span
                    style={{
                      width: 3,
                      height: 8,
                      background: '#10b981',
                      borderRadius: 2,
                      animation: 'pulse 0.9s infinite alternate',
                    }}
                  />
                </div>
              )}

              {/* Participant Name Badge */}
              <div
                style={{
                  position: 'absolute',
                  bottom: 10,
                  left: 10,
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(0, 0, 0, 0.65)',
                  backdropFilter: 'blur(4px)',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>{p.userName}</span>
                {isSelf && (
                  <span style={{ fontSize: 10, opacity: 0.8 }}>(You)</span>
                )}
              </div>

              {/* Status Icons Top-Right */}
              <div
                style={{
                  position: 'absolute',
                  top: 10,
                  right: 10,
                  display: 'flex',
                  gap: 6,
                }}
              >
                {p.isMuted ? (
                  <span
                    style={{
                      background: 'rgba(239, 68, 68, 0.8)',
                      padding: '2px 6px',
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  >
                    🔇
                  </span>
                ) : (
                  <span
                    style={{
                      background: 'rgba(16, 185, 129, 0.8)',
                      padding: '2px 6px',
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  >
                    🎙️
                  </span>
                )}

                {p.isVideoOn ? (
                  <span
                    style={{
                      background: 'rgba(59, 130, 246, 0.8)',
                      padding: '2px 6px',
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  >
                    📹
                  </span>
                ) : (
                  <span
                    style={{
                      background: 'rgba(100, 116, 139, 0.8)',
                      padding: '2px 6px',
                      borderRadius: 6,
                      fontSize: 11,
                    }}
                  >
                    📷
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Media Controls Bottom Bar */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 12,
          padding: '14px 20px',
          background: 'var(--affine-background-secondary-color, #18181b)',
          borderTop: '1px solid var(--affine-border-color, #27272a)',
        }}
      >
        {/* Toggle Mic */}
        <button
          type="button"
          onClick={() => onToggleMic(!isMuted)}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: isMuted ? '1px solid #ef4444' : '1px solid #10b981',
            background: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
            color: isMuted ? '#ef4444' : '#10b981',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{isMuted ? '🔇 Unmute Mic' : '🎙️ Mic Active'}</span>
        </button>

        {/* Toggle Video */}
        <button
          type="button"
          onClick={() => onToggleVideo(!isVideoOn)}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: isVideoOn ? '1px solid #3b82f6' : '1px solid var(--affine-border-color, #27272a)',
            background: isVideoOn ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
            color: isVideoOn ? '#3b82f6' : 'var(--affine-text-secondary-color)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{isVideoOn ? '📹 Camera On' : '📷 Camera Off'}</span>
        </button>

        {/* Toggle Screen Share */}
        <button
          type="button"
          onClick={() => onToggleScreenShare(!isScreenSharing)}
          style={{
            padding: '8px 18px',
            borderRadius: 8,
            border: isScreenSharing ? '1px solid #8b5cf6' : '1px solid var(--affine-border-color, #27272a)',
            background: isScreenSharing ? 'rgba(139, 92, 246, 0.15)' : 'transparent',
            color: isScreenSharing ? '#a78bfa' : 'var(--affine-text-secondary-color)',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <span>{isScreenSharing ? '💻 Stop Sharing' : '🖥️ Share Screen'}</span>
        </button>
      </div>
    </div>
  );
};
