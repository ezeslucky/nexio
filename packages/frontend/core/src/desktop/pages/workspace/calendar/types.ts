export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

export interface CalendarEvent {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  startTime: string; // ISO string
  endTime: string;   // ISO string
  allDay: boolean;
  color: string;     // Hex color e.g. #3b82f6
  location?: string;
  issueId?: string;
  issueKey?: string;
  roomId?: string;
  roomName?: string;
  createdBy: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CalendarFilterOptions {
  showIssues: boolean;
  showMeetings: boolean;
  showEvents: boolean;
}

export const CALENDAR_COLORS = [
  { label: 'Blue (General)', value: '#3b82f6' },
  { label: 'Green (Milestones)', value: '#10b981' },
  { label: 'Amber (Deadlines)', value: '#f59e0b' },
  { label: 'Purple (Meetings)', value: '#8b5cf6' },
  { label: 'Red (Urgent)', value: '#ef4444' },
];
