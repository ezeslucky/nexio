import { notify } from '@nexio/component/ui/notification';
import { useCallback, useState } from 'react';

import { CALENDAR_COLORS, type CalendarEvent } from './types';

interface EventModalProps {
  workspaceId: string;
  event: Partial<CalendarEvent> | null;
  rooms?: Array<{ id: string; name: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<CalendarEvent>) => Promise<void>;
  onDelete?: (eventId: string) => Promise<void>;
}

export const EventModal = ({
  event,
  rooms = [],
  isOpen,
  onClose,
  onSave,
  onDelete,
}: EventModalProps) => {
  if (!isOpen || !event) return null;

  const [title, setTitle] = useState(event.title || '');
  const [description, setDescription] = useState(event.description || '');
  const [startTime, setStartTime] = useState(
    event.startTime ? event.startTime.slice(0, 16) : new Date().toISOString().slice(0, 16)
  );
  const [endTime, setEndTime] = useState(
    event.endTime ? event.endTime.slice(0, 16) : new Date(Date.now() + 3600000).toISOString().slice(0, 16)
  );
  const [allDay, setAllDay] = useState(event.allDay || false);
  const [color, setColor] = useState(event.color || '#3b82f6');
  const [roomId, setRoomId] = useState(event.roomId || '');
  const [issueKey, setIssueKey] = useState(event.issueKey || '');
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!event.id && !event.id.startsWith('issue-event-');
  const isTrackerIssue = event.id?.startsWith('issue-event-');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) {
        notify.warning({ title: 'Title Required', message: 'Please enter an event title.' });
        return;
      }

      setIsSaving(true);
      try {
        const roomObj = rooms.find(r => r.id === roomId);
        await onSave({
          ...event,
          title: title.trim(),
          description: description.trim(),
          startTime: new Date(startTime).toISOString(),
          endTime: new Date(endTime).toISOString(),
          allDay,
          color,
          roomId: roomId || undefined,
          roomName: roomObj?.name,
          issueKey: issueKey.trim() || undefined,
          createdBy: 'Aurobindo Patra',
        });
        onClose();
      } catch {
        notify.error({ title: 'Error', message: 'Failed to save event.' });
      } finally {
        setIsSaving(false);
      }
    },
    [title, description, startTime, endTime, allDay, color, roomId, rooms, issueKey, event, onSave, onClose]
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1050,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
      }}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: 480,
          maxWidth: '90vw',
          background: 'var(--affine-background-primary-color, #18181b)',
          border: '1px solid var(--affine-border-color, #27272a)',
          borderRadius: 12,
          boxShadow: '0 16px 40px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--affine-border-color, #27272a)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 18 }}>📅</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--affine-text-primary-color, #f4f4f5)' }}>
              {isTrackerIssue
                ? 'Tracker Issue Deadline'
                : isEditing
                ? 'Edit Calendar Event'
                : 'Schedule New Event'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--affine-text-secondary-color, #a1a1aa)',
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {isTrackerIssue && (
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                background: 'rgba(245, 158, 11, 0.15)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                fontSize: 12,
                color: '#fbbf24',
              }}
            >
              This is a synced deadline from Tracker issue <strong>{event.issueKey}</strong>. Manage its status in Project Tracker.
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Title</label>
            <input
              type="text"
              readOnly={isTrackerIssue}
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Sprint Planning, Architecture Sync"
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: 8,
                border: '1px solid var(--affine-border-color, #3f3f46)',
                background: 'var(--affine-background-secondary-color, #27272a)',
                color: 'var(--affine-text-primary-color, #f4f4f5)',
                fontSize: 13,
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Start Time</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? startTime.slice(0, 10) : startTime}
                onChange={e => setStartTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--affine-border-color, #3f3f46)',
                  background: 'var(--affine-background-secondary-color, #27272a)',
                  color: 'var(--affine-text-primary-color, #f4f4f5)',
                  fontSize: 12,
                  boxSizing: 'border-box',
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>End Time</label>
              <input
                type={allDay ? 'date' : 'datetime-local'}
                value={allDay ? endTime.slice(0, 10) : endTime}
                onChange={e => setEndTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: 8,
                  border: '1px solid var(--affine-border-color, #3f3f46)',
                  background: 'var(--affine-background-secondary-color, #27272a)',
                  color: 'var(--affine-text-primary-color, #f4f4f5)',
                  fontSize: 12,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              id="allDayCheckbox"
              checked={allDay}
              onChange={e => setAllDay(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            <label htmlFor="allDayCheckbox" style={{ fontSize: 12, cursor: 'pointer' }}>
              All Day Event
            </label>
          </div>

          {/* Color tag picker */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Category & Color</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {CALENDAR_COLORS.map(c => (
                <button
                  type="button"
                  key={c.value}
                  onClick={() => setColor(c.value)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: color === c.value ? '2px solid #fff' : '1px solid transparent',
                    background: c.value,
                    color: '#fff',
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Virtual Office Room Link */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              Virtual Office Room (Optional)
            </label>
            <select
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid var(--affine-border-color, #3f3f46)',
                background: 'var(--affine-background-secondary-color, #27272a)',
                color: 'var(--affine-text-primary-color, #f4f4f5)',
                fontSize: 12,
                boxSizing: 'border-box',
              }}
            >
              <option value="">No Meeting Room (In-Person / External)</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  🏢 {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Link to Tracker Issue */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              Linked Tracker Issue Key (e.g. NEX-101)
            </label>
            <input
              type="text"
              value={issueKey}
              onChange={e => setIssueKey(e.target.value)}
              placeholder="Optional issue key to link"
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid var(--affine-border-color, #3f3f46)',
                background: 'var(--affine-background-secondary-color, #27272a)',
                color: 'var(--affine-text-primary-color, #f4f4f5)',
                fontSize: 12,
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Description */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Agenda / Notes</label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Add event agenda, meeting link, or notes..."
              style={{
                width: '100%',
                padding: '8px 10px',
                borderRadius: 8,
                border: '1px solid var(--affine-border-color, #3f3f46)',
                background: 'var(--affine-background-secondary-color, #27272a)',
                color: 'var(--affine-text-primary-color, #f4f4f5)',
                fontSize: 12,
                fontFamily: 'inherit',
                resize: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Footer Actions */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 10 }}>
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Delete this event?')) {
                    await onDelete(event.id!);
                    onClose();
                  }
                }}
                style={{
                  padding: '6px 12px',
                  borderRadius: 6,
                  border: 'none',
                  background: 'transparent',
                  color: '#ef4444',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Delete Event
              </button>
            ) : (
              <div />
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '7px 14px',
                  borderRadius: 6,
                  border: '1px solid var(--affine-border-color, #3f3f46)',
                  background: 'transparent',
                  color: 'var(--affine-text-secondary-color, #a1a1aa)',
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              {!isTrackerIssue && (
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{
                    padding: '7px 16px',
                    borderRadius: 6,
                    border: 'none',
                    background: 'var(--affine-primary-color, #3b82f6)',
                    color: '#fff',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save Event'}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
