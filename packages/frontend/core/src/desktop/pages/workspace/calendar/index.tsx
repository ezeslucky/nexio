import { notify } from '@nexio/component/ui/notification';
import {
  ViewBody,
  ViewHeader,
  ViewIcon,
  ViewTitle,
} from '@nexio/core/modules/workbench';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { useService } from '@toeverything/infra';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { TrackerApiService } from '../tracker/tracker-service';
import { CalendarGrid } from './calendar-grid';
import { CalendarApiService } from './calendar-service';
import { EventModal } from './event-modal';
import type { CalendarEvent, CalendarFilterOptions, CalendarViewMode } from './types';

export const Component = () => {
  const workspaceService = useService(WorkspaceService);
  const currentWorkspace = workspaceService.workspace;
  const workspaceId = currentWorkspace.id;

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [rooms, setRooms] = useState<Array<{ id: string; name: string }>>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Partial<CalendarEvent> | null>(null);

  const [filters, setFilters] = useState<CalendarFilterOptions>({
    showIssues: true,
    showMeetings: true,
    showEvents: true,
  });

  // Fetch calendar events, tracker issues, and office rooms
  const loadData = useCallback(async () => {
    try {
      const [calEvents, trackerIssues, roomsRes] = await Promise.all([
        CalendarApiService.getEvents(workspaceId).catch(() => []),
        TrackerApiService.getIssues(workspaceId).catch(() => []),
        fetch(`/api/workspaces/${workspaceId}/office/rooms`)
          .then(r => (r.ok ? r.json() : { rooms: [] }))
          .catch(() => ({ rooms: [] })),
      ]);

      const issueEvents = CalendarApiService.convertIssuesToEvents(trackerIssues);
      const combined = [...calEvents, ...issueEvents];
      setEvents(combined);
      setRooms(roomsRes.rooms || []);
    } catch {
      notify.error({ title: 'Error', message: 'Failed to load calendar schedule' });
    }
  }, [workspaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered events
  const displayedEvents = useMemo(() => {
    return events.filter(ev => {
      if (!filters.showIssues && ev.issueKey) return false;
      if (!filters.showMeetings && ev.roomId) return false;
      if (!filters.showEvents && !ev.issueKey && !ev.roomId) return false;
      return true;
    });
  }, [events, filters]);

  // Date Navigation
  const handlePrev = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() - 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() - 7);
    } else {
      next.setDate(next.getDate() - 1);
    }
    setCurrentDate(next);
  };

  const handleNext = () => {
    const next = new Date(currentDate);
    if (viewMode === 'month') {
      next.setMonth(next.getMonth() + 1);
    } else if (viewMode === 'week') {
      next.setDate(next.getDate() + 7);
    } else {
      next.setDate(next.getDate() + 1);
    }
    setCurrentDate(next);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleOpenCreateModal = (presetDate?: Date) => {
    const date = presetDate || new Date();
    const dateStr = date.toISOString().slice(0, 10);
    setSelectedEvent({
      workspaceId,
      title: '',
      startTime: `${dateStr}T10:00:00Z`,
      endTime: `${dateStr}T11:00:00Z`,
      allDay: false,
      color: '#3b82f6',
    });
    setIsModalOpen(true);
  };

  const handleSaveEvent = async (event: Partial<CalendarEvent>) => {
    if (event.id && !event.id.startsWith('issue-event-')) {
      const updated = await CalendarApiService.updateEvent(workspaceId, event.id, event);
      setEvents(prev => prev.map(e => (e.id === updated.id ? updated : e)));
      notify.success({ title: 'Updated', message: 'Calendar event updated.' });
    } else {
      const created = await CalendarApiService.createEvent(workspaceId, event);
      setEvents(prev => [created, ...prev]);
      notify.success({ title: 'Created', message: 'Event scheduled successfully.' });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    await CalendarApiService.deleteEvent(workspaceId, eventId);
    setEvents(prev => prev.filter(e => e.id !== eventId));
    notify.success({ title: 'Deleted', message: 'Event removed from calendar.' });
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'var(--affine-background-primary-color, #18181b)',
        color: 'var(--affine-text-primary-color, #f4f4f5)',
        overflow: 'hidden',
      }}
    >
      <ViewIcon icon="page" />
      <ViewTitle title="Calendar & Scheduling" />

      <ViewHeader>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '12px 20px',
            borderBottom: '1px solid var(--affine-border-color, #27272a)',
          }}
        >
          {/* Left: Module title and Month Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>📅</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>Calendar</span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                type="button"
                onClick={handlePrev}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--affine-border-color, #3f3f46)',
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                ◀
              </button>
              <button
                type="button"
                onClick={handleToday}
                style={{
                  padding: '4px 10px',
                  borderRadius: 6,
                  border: '1px solid var(--affine-border-color, #3f3f46)',
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Today
              </button>
              <button
                type="button"
                onClick={handleNext}
                style={{
                  padding: '4px 8px',
                  borderRadius: 6,
                  border: '1px solid var(--affine-border-color, #3f3f46)',
                  background: 'transparent',
                  color: 'inherit',
                  cursor: 'pointer',
                  fontSize: 12,
                }}
              >
                ▶
              </button>
            </div>

            <div style={{ fontSize: 15, fontWeight: 700 }}>
              {currentDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* Right: View Switcher and + New Event button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* View Mode Buttons */}
            <div
              style={{
                display: 'flex',
                background: 'var(--affine-background-secondary-color, #27272a)',
                borderRadius: 8,
                padding: 2,
                border: '1px solid var(--affine-border-color, #3f3f46)',
              }}
            >
              {(['month', 'week', 'day', 'agenda'] as CalendarViewMode[]).map(mode => (
                <button
                  type="button"
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: 'none',
                    background: viewMode === mode ? 'var(--affine-primary-color, #3b82f6)' : 'transparent',
                    color: viewMode === mode ? '#fff' : 'var(--affine-text-secondary-color, #a1a1aa)',
                    fontWeight: 600,
                    fontSize: 11,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Filter checkboxes */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showIssues}
                  onChange={e => setFilters(f => ({ ...f, showIssues: e.target.checked }))}
                />
                Deadlines
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={filters.showMeetings}
                  onChange={e => setFilters(f => ({ ...f, showMeetings: e.target.checked }))}
                />
                Meetings
              </label>
            </div>

            <button
              type="button"
              onClick={() => handleOpenCreateModal()}
              style={{
                padding: '6px 14px',
                borderRadius: 6,
                border: 'none',
                background: 'var(--affine-primary-color, #3b82f6)',
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              + New Event
            </button>
          </div>
        </div>
      </ViewHeader>

      <ViewBody>
        <CalendarGrid
          currentDate={currentDate}
          viewMode={viewMode}
          events={displayedEvents}
          onSelectDate={d => handleOpenCreateModal(d)}
          onSelectEvent={ev => {
            setSelectedEvent(ev);
            setIsModalOpen(true);
          }}
        />

        <EventModal
          workspaceId={workspaceId}
          event={selectedEvent}
          rooms={rooms}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
        />
      </ViewBody>
    </div>
  );
};
