import type {
  OfficeJoinResponse,
  OfficeMediaStateUpdate,
  OfficeParticipant,
  OfficeRoom,
  OfficeRoomsResponse,
  OfficeRoomType,
} from './types';

export class OfficeService {
  private static getBaseUrl(workspaceId: string): string {
    return `/api/workspaces/${encodeURIComponent(workspaceId)}/office`;
  }

  static async getRooms(workspaceId: string): Promise<OfficeRoomsResponse> {
    const res = await fetch(`${this.getBaseUrl(workspaceId)}/rooms`);
    if (!res.ok) {
      throw new Error(`Failed to load office rooms: ${res.statusText}`);
    }
    return res.json();
  }

  static async createRoom(
    workspaceId: string,
    payload: {
      name: string;
      type: OfficeRoomType;
      description?: string;
      capacity?: number;
    }
  ): Promise<OfficeRoom> {
    const res = await fetch(`${this.getBaseUrl(workspaceId)}/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      throw new Error(`Failed to create office room: ${res.statusText}`);
    }
    return res.json();
  }

  static async joinRoom(
    workspaceId: string,
    roomId: string,
    user?: { userId?: string; userName?: string; avatarUrl?: string }
  ): Promise<OfficeJoinResponse> {
    const res = await fetch(
      `${this.getBaseUrl(workspaceId)}/rooms/${encodeURIComponent(roomId)}/join`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user || {}),
      }
    );
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(errText || `Failed to join room: ${res.statusText}`);
    }
    return res.json();
  }

  static async leaveRoom(
    workspaceId: string,
    roomId: string,
    userId?: string
  ): Promise<{ success: boolean; room?: OfficeRoom }> {
    const res = await fetch(
      `${this.getBaseUrl(workspaceId)}/rooms/${encodeURIComponent(roomId)}/leave`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to leave room: ${res.statusText}`);
    }
    return res.json();
  }

  static async updateMediaState(
    workspaceId: string,
    roomId: string,
    update: OfficeMediaStateUpdate
  ): Promise<OfficeParticipant> {
    const res = await fetch(
      `${this.getBaseUrl(workspaceId)}/rooms/${encodeURIComponent(roomId)}/media-state`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      }
    );
    if (!res.ok) {
      throw new Error(`Failed to update media state: ${res.statusText}`);
    }
    return res.json();
  }
}
