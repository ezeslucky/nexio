export interface OfficeParticipant {
  userId: string;
  userName: string;
  avatarUrl: string;
  isMuted: boolean;
  isVideoOn: boolean;
  isScreenSharing: boolean;
  joinedAt: string;
}

export type OfficeRoomType =
  | 'open_lounge'
  | 'meeting'
  | 'focus'
  | 'pair_programming';

export interface OfficeRoom {
  id: string;
  workspaceId: string;
  name: string;
  type: OfficeRoomType;
  description: string;
  capacity: number;
  isLocked: boolean;
  participants: OfficeParticipant[];
  createdAt: string;
}

export interface OfficeRoomsResponse {
  rooms: OfficeRoom[];
  total: number;
  totalOccupants: number;
}

export interface OfficeJoinResponse {
  room: OfficeRoom;
  participant: OfficeParticipant;
  signaling: {
    mode: string;
    iceServers: Array<{ urls: string }>;
  };
}

export interface OfficeMediaStateUpdate {
  userId?: string;
  isMuted?: boolean;
  isVideoOn?: boolean;
  isScreenSharing?: boolean;
}
