import { describe, expect, it } from 'vitest';
import type { OfficeParticipant, OfficeRoom, OfficeRoomType } from '../types';

describe('Virtual Office Logic & State Transitions', () => {
  it('enforces single room presence: moving to a new room removes user from previous room', () => {
    let rooms: OfficeRoom[] = [
      {
        id: 'room-lounge',
        workspaceId: 'ws-1',
        name: 'Main Lounge',
        type: 'open_lounge',
        description: 'Social lounge',
        capacity: 16,
        isLocked: false,
        createdAt: '2026-11-26T00:00:00Z',
        participants: [
          {
            userId: 'user-aur',
            userName: 'Aurobindo Patra',
            avatarUrl: '',
            isMuted: false,
            isVideoOn: true,
            isScreenSharing: false,
            joinedAt: '2026-11-26T00:00:00Z',
          },
        ],
      },
      {
        id: 'room-meeting',
        workspaceId: 'ws-1',
        name: 'Frontend Huddle',
        type: 'meeting',
        description: 'Sprint planning',
        capacity: 8,
        isLocked: false,
        createdAt: '2026-11-26T00:00:00Z',
        participants: [],
      },
    ];

    const joinRoom = (roomId: string, user: OfficeParticipant) => {
      // 1. Remove user from all rooms first
      rooms = rooms.map(r => ({
        ...r,
        participants: r.participants.filter(p => p.userId !== user.userId),
      }));

      // 2. Add to target room
      rooms = rooms.map(r => {
        if (r.id === roomId) {
          return {
            ...r,
            participants: [...r.participants, user],
          };
        }
        return r;
      });
    };

    // User moves to Frontend Huddle
    joinRoom('room-meeting', {
      userId: 'user-aur',
      userName: 'Aurobindo Patra',
      avatarUrl: '',
      isMuted: true,
      isVideoOn: true,
      isScreenSharing: false,
      joinedAt: '2026-11-26T00:05:00Z',
    });

    // Main Lounge should now have 0 occupants
    const lounge = rooms.find(r => r.id === 'room-lounge');
    expect(lounge?.participants.length).toBe(0);

    // Frontend Huddle should now have Aurobindo
    const meeting = rooms.find(r => r.id === 'room-meeting');
    expect(meeting?.participants.length).toBe(1);
    expect(meeting?.participants[0].userId).toBe('user-aur');
  });

  it('rejects joining when room is at maximum capacity or locked', () => {
    const fullRoom: OfficeRoom = {
      id: 'room-pod',
      workspaceId: 'ws-1',
      name: 'Focus Pod',
      type: 'focus',
      description: 'Muted pod',
      capacity: 2,
      isLocked: false,
      createdAt: '2026-11-26T00:00:00Z',
      participants: [
        {
          userId: 'user-1',
          userName: 'Alice',
          avatarUrl: '',
          isMuted: true,
          isVideoOn: false,
          isScreenSharing: false,
          joinedAt: '2026-11-26T00:00:00Z',
        },
        {
          userId: 'user-2',
          userName: 'Bob',
          avatarUrl: '',
          isMuted: true,
          isVideoOn: false,
          isScreenSharing: false,
          joinedAt: '2026-11-26T00:00:00Z',
        },
      ],
    };

    const lockedRoom: OfficeRoom = {
      ...fullRoom,
      id: 'room-locked',
      capacity: 10,
      participants: [],
      isLocked: true,
    };

    const canJoinRoom = (room: OfficeRoom): { allowed: boolean; reason?: string } => {
      if (room.isLocked) {
        return { allowed: false, reason: 'room is locked' };
      }
      if (room.participants.length >= room.capacity) {
        return { allowed: false, reason: 'room is full' };
      }
      return { allowed: true };
    };

    expect(canJoinRoom(fullRoom)).toEqual({ allowed: false, reason: 'room is full' });
    expect(canJoinRoom(lockedRoom)).toEqual({ allowed: false, reason: 'room is locked' });
  });

  it('handles room leave logic cleanly', () => {
    let participants: OfficeParticipant[] = [
      {
        userId: 'user-aur',
        userName: 'Aurobindo Patra',
        avatarUrl: '',
        isMuted: false,
        isVideoOn: true,
        isScreenSharing: false,
        joinedAt: '2026-11-26T00:00:00Z',
      },
      {
        userId: 'user-alex',
        userName: 'Alex Chen',
        avatarUrl: '',
        isMuted: true,
        isVideoOn: false,
        isScreenSharing: false,
        joinedAt: '2026-11-26T00:00:00Z',
      },
    ];

    const leaveRoom = (userId: string) => {
      participants = participants.filter(p => p.userId !== userId);
    };

    leaveRoom('user-aur');
    expect(participants.length).toBe(1);
    expect(participants[0].userId).toBe('user-alex');
  });

  it('updates participant media state (mic, camera, screen share)', () => {
    let participant: OfficeParticipant = {
      userId: 'user-aur',
      userName: 'Aurobindo Patra',
      avatarUrl: '',
      isMuted: false,
      isVideoOn: true,
      isScreenSharing: false,
      joinedAt: '2026-11-26T00:00:00Z',
    };

    const updateMedia = (update: Partial<OfficeParticipant>) => {
      participant = { ...participant, ...update };
    };

    // Toggle Mute
    updateMedia({ isMuted: true });
    expect(participant.isMuted).toBe(true);

    // Toggle Screen Share
    updateMedia({ isScreenSharing: true });
    expect(participant.isScreenSharing).toBe(true);

    // Turn Camera Off
    updateMedia({ isVideoOn: false });
    expect(participant.isVideoOn).toBe(false);
  });

  it('filters rooms by category and computes total workspace occupants', () => {
    const rooms: OfficeRoom[] = [
      {
        id: '1',
        workspaceId: 'w',
        name: 'Lounge',
        type: 'open_lounge',
        description: '',
        capacity: 10,
        isLocked: false,
        createdAt: '',
        participants: [
          { userId: 'u1', userName: 'U1', avatarUrl: '', isMuted: false, isVideoOn: true, isScreenSharing: false, joinedAt: '' },
          { userId: 'u2', userName: 'U2', avatarUrl: '', isMuted: true, isVideoOn: false, isScreenSharing: false, joinedAt: '' },
        ],
      },
      {
        id: '2',
        workspaceId: 'w',
        name: 'Standup',
        type: 'meeting',
        description: '',
        capacity: 8,
        isLocked: false,
        createdAt: '',
        participants: [
          { userId: 'u3', userName: 'U3', avatarUrl: '', isMuted: false, isVideoOn: true, isScreenSharing: true, joinedAt: '' },
        ],
      },
      {
        id: '3',
        workspaceId: 'w',
        name: 'Pair 1',
        type: 'pair_programming',
        description: '',
        capacity: 4,
        isLocked: false,
        createdAt: '',
        participants: [],
      },
    ];

    const filterByType = (type: OfficeRoomType | 'all') => {
      if (type === 'all') return rooms;
      return rooms.filter(r => r.type === type);
    };

    expect(filterByType('meeting').length).toBe(1);
    expect(filterByType('meeting')[0].name).toBe('Standup');
    expect(filterByType('pair_programming').length).toBe(1);
    expect(filterByType('all').length).toBe(3);

    const totalOccupants = rooms.reduce((acc, r) => acc + r.participants.length, 0);
    expect(totalOccupants).toBe(3);
  });
});
