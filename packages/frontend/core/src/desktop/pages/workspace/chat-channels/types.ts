export interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  mimeType: string;
  url: string;
}

export interface ChatReaction {
  emoji: string;
  users: string[];
  count: number;
}

export interface ChatMessage {
  id: string;
  workspaceId: string;
  channelId?: string;
  dmId?: string;
  parentId?: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  mentions: string[];
  attachments: ChatAttachment[];
  reactions: ChatReaction[];
  threadCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ChatChannel {
  id: string;
  workspaceId: string;
  name: string;
  description?: string;
  topic?: string;
  isPrivate: boolean;
  members: string[];
  unreadCount: number;
  createdAt: string;
}

export interface DirectMessageConv {
  id: string;
  workspaceId: string;
  members: string[];
  lastMessage: string;
  unreadCount: number;
  updatedAt: string;
}

export interface ThreadData {
  parent: ChatMessage;
  replies: ChatMessage[];
  total: number;
}
