export interface DocVersionSnapshot {
  id: string;
  docId: string;
  versionNumber: number;
  title: string;
  summary: string;
  author: string;
  createdAt: string;
  size: number;
}

export interface DocCommentReply {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface DocComment {
  id: string;
  docId: string;
  blockId?: string;
  author: string;
  content: string;
  resolved: boolean;
  createdAt: string;
  replies: DocCommentReply[];
}

export interface DocLinkedIssue {
  issueId: string;
  title: string;
  status: string;
  priority: string;
  assignee: string;
}
