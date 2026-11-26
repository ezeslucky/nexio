import type { OfficeRoom, OfficeRoomType } from './types';

interface RoomCardProps {
  room: OfficeRoom;
  isJoined: boolean;
  onJoin: (roomId: string) => void;
  onLeave: (roomId: string) => void;
}

const ROOM_ICONS: Record<OfficeRoomType, string> = {
  open_lounge: '☕',
  meeting: '🎙️',
  pair_programming: '💻',
  focus: '🎧',
};

const ROOM_LABELS: Record<OfficeRoomType, string> = {
  open_lounge: 'Lounge',
  meeting: 'Meeting',
  pair_programming: 'Pairing',
  focus: 'Focus Pod',
};

export const RoomCard = ({
  room,
  isJoined,
  onJoin,
  onLeave,
}: RoomCardProps) => {
  const isFull = room.participants.length >= room.capacity;
  const fillPercentage = Math.min(
    100,
    (room.participants.length / room.capacity) * 100
  );

  return (
    <div
      className="huly-card"
      style={{
        background: isJoined
          ? 'rgba(20, 24, 34, 0.95)'
          : 'var(--huly-bg-card, rgba(20, 24, 34, 0.85))',
        borderRadius: 14,
        border: isJoined
          ? '2px solid #6366f1'
          : '1px solid var(--huly-border, rgba(255, 255, 255, 0.08))',
        padding: '20px 22px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        minHeight: 230,
        boxShadow: isJoined
          ? '0 0 24px rgba(99, 102, 241, 0.35)'
          : 'var(--huly-card-shadow)',
        transition: 'all 0.22s var(--huly-bezier-spring, cubic-bezier(0.16, 1, 0.3, 1))',
      }}
    >
      <div>
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            marginBottom: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 24 }}>
              {ROOM_ICONS[room.type] || '🚪'}
            </span>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700 }}>{room.name}</div>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--affine-text-secondary-color, #a1a1aa)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  marginTop: 2,
                }}
              >
                <span>{ROOM_LABELS[room.type] || room.type}</span>
                <span>•</span>
                <span>
                  {room.participants.length} / {room.capacity} seats
                </span>
              </div>
            </div>
          </div>

          {isJoined && (
            <span
              style={{
                padding: '3px 8px',
                borderRadius: 6,
                background: '#10b98122',
                color: '#10b981',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.05em',
              }}
            >
              CONNECTED
            </span>
          )}
        </div>

        {/* Capacity Progress Bar */}
        <div
          style={{
            height: 4,
            width: '100%',
            background: 'var(--affine-border-color, #27272a)',
            borderRadius: 2,
            marginBottom: 14,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${fillPercentage}%`,
              background:
                fillPercentage >= 100
                  ? '#ef4444'
                  : fillPercentage > 75
                    ? '#f59e0b'
                    : 'var(--affine-primary-color, #3b82f6)',
              transition: 'width 0.3s ease',
            }}
          />
        </div>

        <p
          style={{
            fontSize: 13,
            color: 'var(--affine-text-secondary-color, #a1a1aa)',
            lineHeight: 1.45,
            margin: '0 0 16px 0',
          }}
        >
          {room.description || 'Virtual collaboration room.'}
        </p>

        {/* Present Occupants */}
        <div style={{ marginBottom: 18 }}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: 'var(--affine-text-secondary-color, #71717a)',
              marginBottom: 8,
            }}
          >
            Occupants ({room.participants.length})
          </div>
          {room.participants.length > 0 ? (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {room.participants.map(p => (
                <div
                  key={p.userId}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 16,
                    background: 'var(--affine-background-primary-color, #09090b)',
                    border: '1px solid var(--affine-border-color, #27272a)',
                    fontSize: 12,
                  }}
                >
                  {!p.isMuted ? (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 2,
                        height: 12,
                        marginRight: 2,
                      }}
                      title="Speaking"
                    >
                      <span
                        style={{
                          width: 2,
                          height: 8,
                          background: '#10b981',
                          borderRadius: 1,
                          animation: 'hulyAudioWave 0.7s ease-in-out infinite alternate',
                        }}
                      />
                      <span
                        style={{
                          width: 2,
                          height: 14,
                          background: '#10b981',
                          borderRadius: 1,
                          animation: 'hulyAudioWave 0.7s ease-in-out infinite alternate 0.2s',
                        }}
                      />
                      <span
                        style={{
                          width: 2,
                          height: 6,
                          background: '#10b981',
                          borderRadius: 1,
                          animation: 'hulyAudioWave 0.7s ease-in-out infinite alternate 0.4s',
                        }}
                      />
                    </span>
                  ) : (
                    <span
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: '#f59e0b',
                      }}
                    />
                  )}
                  <span>{p.userName}</span>
                  {p.isMuted && <span style={{ fontSize: 10 }}>🔇</span>}
                  {p.isScreenSharing && <span style={{ fontSize: 10 }}>💻</span>}
                </div>
              ))}
            </div>
          ) : (
            <span
              style={{
                fontSize: 12,
                color: 'var(--affine-text-secondary-color, #71717a)',
                fontStyle: 'italic',
              }}
            >
              Empty room — click join to enter
            </span>
          )}
        </div>
      </div>

      {/* Action Button */}
      {isJoined ? (
        <button
          type="button"
          onClick={() => onLeave(room.id)}
          style={{
            padding: '9px 16px',
            borderRadius: 8,
            border: 'none',
            background: '#ef4444',
            color: '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: 'pointer',
            width: '100%',
          }}
        >
          Leave Room
        </button>
      ) : (
        <button
          type="button"
          disabled={isFull}
          onClick={() => onJoin(room.id)}
          style={{
            padding: '9px 16px',
            borderRadius: 8,
            border: 'none',
            background: isFull
              ? 'var(--affine-border-color, #27272a)'
              : 'var(--affine-primary-color, #3b82f6)',
            color: isFull
              ? 'var(--affine-text-secondary-color, #71717a)'
              : '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: isFull ? 'not-allowed' : 'pointer',
            width: '100%',
          }}
        >
          {isFull ? 'Room Full' : 'Join Room'}
        </button>
      )}
    </div>
  );
};
