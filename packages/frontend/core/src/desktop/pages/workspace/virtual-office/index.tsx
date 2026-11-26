import { notify } from '@nexio/component/ui/notification';
import {
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
} from '@nexio/core/modules/workbench';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { useService } from '@toeverything/infra';
import { useCallback, useEffect, useState } from 'react';

import { ActiveRoomCall } from './active-room-call';
import { NewRoomModal } from './new-room-modal';
import { OfficeService } from './office-service';
import { RoomCard } from './room-card';
import type { OfficeRoom, OfficeRoomType } from './types';

export const Component = () => {
  const workspaceService = useService(WorkspaceService);
  const currentWorkspace = workspaceService.workspace;
  const workspaceId = currentWorkspace?.id || 'default';

  const [rooms, setRooms] = useState<OfficeRoom[]>([]);
  const [totalOccupants, setTotalOccupants] = useState(0);
  const [joinedRoomId, setJoinedRoomId] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUserId] = useState('user-aur');

  const fetchRooms = useCallback(async () => {
    try {
      const data = await OfficeService.getRooms(workspaceId);
      setRooms(data.rooms);
      setTotalOccupants(data.totalOccupants);

      // Check if user is already joined in one of the rooms
      const existing = data.rooms.find(r =>
        r.participants.some(p => p.userId === currentUserId)
      );
      if (existing) {
        setJoinedRoomId(existing.id);
      }
    } catch (err) {
      console.warn('Failed to fetch office rooms:', err);
    }
  }, [workspaceId, currentUserId]);

  useEffect(() => {
    fetchRooms();
    const interval = setInterval(fetchRooms, 4000);
    return () => clearInterval(interval);
  }, [fetchRooms]);

  const handleJoin = async (roomId: string) => {
    try {
      const res = await OfficeService.joinRoom(workspaceId, roomId, {
        userId: currentUserId,
        userName: 'Aurobindo Patra',
      });
      setJoinedRoomId(roomId);
      notify.success({
        title: 'Joined Office Room',
        message: `Connected to ${res.room.name}.`,
      });
      fetchRooms();
    } catch (err: any) {
      notify.error({
        title: 'Cannot Join Room',
        message: err?.message || 'Failed to connect to room.',
      });
    }
  };

  const handleLeave = async (roomId: string) => {
    try {
      await OfficeService.leaveRoom(workspaceId, roomId, currentUserId);
      setJoinedRoomId(null);
      notify.warning({
        title: 'Left Room',
        message: 'You disconnected from the room.',
      });
      fetchRooms();
    } catch (err: any) {
      notify.error({
        title: 'Error',
        message: err?.message || 'Failed to leave room.',
      });
    }
  };

  const handleToggleMic = async (muted: boolean) => {
    if (!joinedRoomId) return;
    try {
      await OfficeService.updateMediaState(workspaceId, joinedRoomId, {
        userId: currentUserId,
        isMuted: muted,
      });
      fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleVideo = async (videoOn: boolean) => {
    if (!joinedRoomId) return;
    try {
      await OfficeService.updateMediaState(workspaceId, joinedRoomId, {
        userId: currentUserId,
        isVideoOn: videoOn,
      });
      fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleScreenShare = async (sharing: boolean) => {
    if (!joinedRoomId) return;
    try {
      await OfficeService.updateMediaState(workspaceId, joinedRoomId, {
        userId: currentUserId,
        isScreenSharing: sharing,
      });
      fetchRooms();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateRoom = async (roomData: {
    name: string;
    type: OfficeRoomType;
    description: string;
    capacity: number;
  }) => {
    try {
      const newRoom = await OfficeService.createRoom(workspaceId, roomData);
      setRooms(prev => [...prev, newRoom]);
      notify.success({
        title: 'Room Created',
        message: `Created room "${newRoom.name}".`,
      });
    } catch (err: any) {
      notify.error({
        title: 'Failed to create room',
        message: err?.message || 'Could not create room.',
      });
    }
  };

  const activeRoom = rooms.find(r => r.id === joinedRoomId);

  const filteredRooms = rooms.filter(r => {
    if (filter === 'all') return true;
    return r.type === filter;
  });

  return (
    <>
      <ViewHeader>
        <ViewIcon icon="edgeless" />
        <ViewTitle title="Virtual Office" />
      </ViewHeader>

      <ViewBody>
        <div
          className="huly-grid-bg huly-scroll"
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            width: '100%',
            padding: '24px 32px',
            boxSizing: 'border-box',
            overflowY: 'auto',
          }}
        >
          {/* Header Banner */}
          <div
            className="huly-glass-panel"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '22px 28px',
              borderRadius: 14,
              border: '1px solid var(--huly-border, rgba(255, 255, 255, 0.08))',
              marginBottom: 24,
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>
                  Spatial Virtual Office
                </h1>
                <span
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: '#10b98122',
                    color: '#10b981',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  LIVE PRESENCE
                </span>
              </div>
              <p
                style={{
                  margin: 0,
                  fontSize: 13,
                  color: 'var(--affine-text-secondary-color, #a1a1aa)',
                }}
              >
                Seamlessly move between rooms to collaborate over real-time voice, video and screen share.
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Stats badges */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 14px',
                  borderRadius: 8,
                  background: 'var(--affine-background-secondary-color, #18181b)',
                  border: '1px solid var(--affine-border-color, #27272a)',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                <span>{totalOccupants} Colleagues Online</span>
              </div>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                style={{
                  padding: '9px 18px',
                  borderRadius: 8,
                  border: 'none',
                  background: 'var(--affine-primary-color, #3b82f6)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
                }}
              >
                <span>+ Create Room</span>
              </button>
            </div>
          </div>

          {/* Active Call Stage (if user is joined in a room) */}
          {activeRoom && (
            <ActiveRoomCall
              room={activeRoom}
              currentUserId={currentUserId}
              onLeave={() => handleLeave(activeRoom.id)}
              onToggleMic={handleToggleMic}
              onToggleVideo={handleToggleVideo}
              onToggleScreenShare={handleToggleScreenShare}
            />
          )}

          {/* Filter Bar */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20,
            }}
          >
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { id: 'all', label: 'All Spaces' },
                { id: 'open_lounge', label: '☕ Open Lounge' },
                { id: 'meeting', label: '🎙️ Meeting' },
                { id: 'pair_programming', label: '💻 Pair Programming' },
                { id: 'focus', label: '🎧 Focus Pods' },
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 8,
                    border: '1px solid',
                    borderColor:
                      filter === tab.id
                        ? 'var(--affine-primary-color, #3b82f6)'
                        : 'var(--affine-border-color, #27272a)',
                    background:
                      filter === tab.id
                        ? 'rgba(59, 130, 246, 0.12)'
                        : 'var(--affine-background-secondary-color, #18181b)',
                    color:
                      filter === tab.id
                        ? 'var(--affine-primary-color, #3b82f6)'
                        : 'var(--affine-text-secondary-color, #a1a1aa)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <span style={{ fontSize: 12, color: 'var(--affine-text-secondary-color)' }}>
              Showing {filteredRooms.length} of {rooms.length} rooms
            </span>
          </div>

          {/* Rooms Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
              gap: 20,
            }}
          >
            {filteredRooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                isJoined={room.id === joinedRoomId}
                onJoin={handleJoin}
                onLeave={handleLeave}
              />
            ))}
          </div>

          <NewRoomModal
            open={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onCreate={handleCreateRoom}
          />
        </div>
      </ViewBody>
    </>
  );
};
