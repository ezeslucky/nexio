import type { CalendarEvent } from './types';

export class CalendarApiService {
  private static baseUrl = '/api/workspaces';

  static async getEvents(
    workspaceId: string,
    startDate?: string,
    endDate?: string
  ): Promise<CalendarEvent[]> {
    const params = new URLSearchParams();
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${this.baseUrl}/${workspaceId}/calendar/events${query}`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.events || [];
  }

  static async createEvent(
    workspaceId: string,
    event: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/calendar/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event),
    });
    if (!res.ok) throw new Error('Failed to create calendar event');
    return await res.json();
  }

  static async updateEvent(
    workspaceId: string,
    eventId: string,
    updates: Partial<CalendarEvent>
  ): Promise<CalendarEvent> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/calendar/events/${eventId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update calendar event');
    return await res.json();
  }

  static async deleteEvent(workspaceId: string, eventId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/calendar/events/${eventId}`, {
      method: 'DELETE',
    });
    return res.ok;
  }

  static convertIssuesToEvents(
    issues: Array<{ id: string; title: string; dueDate?: string; priority?: string; status?: string }>
  ): CalendarEvent[] {
    return issues
      .filter(iss => !!iss.dueDate)
      .map(iss => {
        const dateStr = iss.dueDate as string;
        // Construct start and end time
        const start = dateStr.includes('T') ? dateStr : `${dateStr}T09:00:00Z`;
        const end = dateStr.includes('T') ? dateStr : `${dateStr}T10:00:00Z`;
        const isUrgent = iss.priority === 'urgent';
        return {
          id: `issue-event-${iss.id}`,
          workspaceId: '',
          title: `[${iss.id}] ${iss.title}`,
          description: `Tracker issue due: ${iss.title} (${iss.status || 'todo'})`,
          startTime: start,
          endTime: end,
          allDay: true,
          color: isUrgent ? '#ef4444' : '#f59e0b',
          issueId: iss.id,
          issueKey: iss.id,
          createdBy: 'Tracker Sync',
        };
      });
  }
}
