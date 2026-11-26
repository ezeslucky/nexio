import { useMemo } from 'react';

import type { CalendarEvent, CalendarViewMode } from './types';

interface CalendarGridProps {
  currentDate: Date;
  viewMode: CalendarViewMode;
  events: CalendarEvent[];
  onSelectEvent: (event: CalendarEvent) => void;
  onSelectDate: (date: Date) => void;
}

export const CalendarGrid = ({
  currentDate,
  viewMode,
  events,
  onSelectEvent,
  onSelectDate,
}: CalendarGridProps) => {
  // Helpers for calendar calculation
  const { monthDays, weekDays } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // Month calculation
    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
    const lastDayOfMonth = new Date(year, month + 1, 0).getDate();
    const days: Array<{ date: Date; isCurrentMonth: boolean }> = [];

    // Prev month padding
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= lastDayOfMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill complete weeks (up to 35 or 42 cells)
    const remaining = 35 - days.length >= 0 ? 35 - days.length : 42 - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    // Week calculation
    const currentDayOfWeek = currentDate.getDay();
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDayOfWeek);
    const wDays: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      wDays.push(d);
    }

    return { monthDays: days, weekDays: wDays };
  }, [currentDate]);

  // Group events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const ev of events) {
      const key = ev.startTime?.slice(0, 10);
      if (!key) continue;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(ev);
    }
    return map;
  }, [events]);

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  const toDateKey = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const WEEK_HEADERS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // AGENDA VIEW
  if (viewMode === 'agenda') {
    const sorted = [...events].sort(
      (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
    );

    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
        {sorted.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#71717a', fontSize: 13 }}>
            No scheduled events or deadlines found.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 800, margin: '0 auto' }}>
            {sorted.map(ev => {
              const start = new Date(ev.startTime);
              const isIss = !!ev.issueKey;
              return (
                <div
                  key={ev.id}
                  onClick={() => onSelectEvent(ev)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    borderRadius: 10,
                    background: 'var(--affine-background-secondary-color, #27272a)',
                    border: `1px solid ${ev.color || 'var(--affine-border-color, #3f3f46)'}`,
                    cursor: 'pointer',
                    transition: 'transform 0.1s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div
                      style={{
                        width: 4,
                        height: 36,
                        borderRadius: 2,
                        background: ev.color || '#3b82f6',
                      }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--affine-text-primary-color, #f4f4f5)' }}>
                          {ev.title}
                        </span>
                        {ev.roomName && (
                          <span
                            style={{
                              fontSize: 11,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: 'rgba(139, 92, 246, 0.15)',
                              color: '#a78bfa',
                            }}
                          >
                            🏢 {ev.roomName}
                          </span>
                        )}
                        {isIss && (
                          <span
                            style={{
                              fontSize: 11,
                              padding: '2px 6px',
                              borderRadius: 4,
                              background: 'rgba(245, 158, 11, 0.15)',
                              color: '#fbbf24',
                              fontWeight: 600,
                            }}
                          >
                            🎯 {ev.issueKey}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--affine-text-secondary-color, #a1a1aa)', marginTop: 4 }}>
                        {start.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                        {' • '}
                        {ev.allDay
                          ? 'All Day'
                          : `${start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(ev.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // WEEK VIEW
  if (viewMode === 'week') {
    return (
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Week Day Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            borderBottom: '1px solid var(--affine-border-color, #27272a)',
            background: 'var(--affine-background-primary-color, #18181b)',
          }}
        >
          {weekDays.map((d, idx) => {
            const today = isToday(d);
            return (
              <div
                key={idx}
                style={{
                  padding: '10px 8px',
                  textAlign: 'center',
                  borderRight: idx < 6 ? '1px solid var(--affine-border-color, #27272a)' : 'none',
                }}
              >
                <div style={{ fontSize: 11, color: '#71717a', textTransform: 'uppercase' }}>
                  {WEEK_HEADERS[idx]}
                </div>
                <div
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    marginTop: 2,
                    color: today ? 'var(--affine-primary-color, #3b82f6)' : 'inherit',
                  }}
                >
                  {d.getDate()}
                </div>
              </div>
            );
          })}
        </div>

        {/* Week Columns */}
        <div
          style={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            overflowY: 'auto',
          }}
        >
          {weekDays.map((d, idx) => {
            const key = toDateKey(d);
            const dayEvents = eventsByDate.get(key) || [];
            return (
              <div
                key={idx}
                onClick={() => onSelectDate(d)}
                style={{
                  minHeight: 350,
                  borderRight: idx < 6 ? '1px solid var(--affine-border-color, #27272a)' : 'none',
                  padding: 8,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 6,
                  background: isToday(d) ? 'rgba(59, 130, 246, 0.03)' : 'transparent',
                }}
              >
                {dayEvents.map(ev => (
                  <div
                    key={ev.id}
                    onClick={e => {
                      e.stopPropagation();
                      onSelectEvent(ev);
                    }}
                    style={{
                      padding: '6px 8px',
                      borderRadius: 6,
                      background: ev.color || '#3b82f6',
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                      cursor: 'pointer',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div>{ev.title}</div>
                    <div style={{ fontSize: 10, opacity: 0.85, marginTop: 2 }}>
                      {ev.allDay ? 'All Day' : new Date(ev.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // DAY VIEW
  if (viewMode === 'day') {
    const key = toDateKey(currentDate);
    const dayEvents = eventsByDate.get(key) || [];

    return (
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>
            Events for {currentDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
          {dayEvents.length === 0 ? (
            <div style={{ padding: 40, textAlign: 'center', color: '#71717a', fontSize: 13 }}>
              No events scheduled for this day. Click "+ New Event" to schedule one.
            </div>
          ) : (
            dayEvents.map(ev => (
              <div
                key={ev.id}
                onClick={() => onSelectEvent(ev)}
                style={{
                  padding: 16,
                  borderRadius: 10,
                  background: 'var(--affine-background-secondary-color, #27272a)',
                  borderLeft: `4px solid ${ev.color || '#3b82f6'}`,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 700 }}>{ev.title}</div>
                <div style={{ fontSize: 12, color: '#a1a1aa', marginTop: 4 }}>
                  {ev.allDay ? 'All Day' : `${new Date(ev.startTime).toLocaleTimeString()} - ${new Date(ev.endTime).toLocaleTimeString()}`}
                </div>
                {ev.roomName && (
                  <div style={{ fontSize: 12, color: '#a78bfa', marginTop: 6 }}>
                    🏢 Room: {ev.roomName}
                  </div>
                )}
                {ev.description && (
                  <div style={{ fontSize: 12, color: '#d4d4d8', marginTop: 8 }}>
                    {ev.description}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // DEFAULT: MONTH VIEW
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Month Days Header */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          borderBottom: '1px solid var(--affine-border-color, #27272a)',
          background: 'var(--affine-background-primary-color, #18181b)',
        }}
      >
        {WEEK_HEADERS.map((h, i) => (
          <div
            key={i}
            style={{
              padding: '10px 8px',
              textAlign: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--affine-text-secondary-color, #71717a)',
              textTransform: 'uppercase',
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* 7x5 or 7x6 Grid Cells */}
      <div
        style={{
          flex: 1,
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gridAutoRows: '1fr',
          overflowY: 'auto',
        }}
      >
        {monthDays.map(({ date, isCurrentMonth }, idx) => {
          const key = toDateKey(date);
          const dayEvents = eventsByDate.get(key) || [];
          const today = isToday(date);

          return (
            <div
              key={idx}
              onClick={() => onSelectDate(date)}
              style={{
                borderRight: '1px solid var(--affine-border-color, #27272a)',
                borderBottom: '1px solid var(--affine-border-color, #27272a)',
                padding: '6px 8px',
                minHeight: 90,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
                background: today
                  ? 'rgba(59, 130, 246, 0.05)'
                  : isCurrentMonth
                  ? 'transparent'
                  : 'rgba(255, 255, 255, 0.015)',
                opacity: isCurrentMonth ? 1 : 0.45,
                cursor: 'pointer',
                transition: 'background 0.1s ease',
              }}
            >
              {/* Day Number */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: today ? 700 : 500,
                    width: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    background: today ? 'var(--affine-primary-color, #3b82f6)' : 'transparent',
                    color: today ? '#fff' : 'inherit',
                  }}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 2 && (
                  <span style={{ fontSize: 10, color: '#71717a' }}>+{dayEvents.length - 2} more</span>
                )}
              </div>

              {/* Event Chips */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3, overflow: 'hidden' }}>
                {dayEvents.slice(0, 3).map(ev => (
                  <div
                    key={ev.id}
                    onClick={e => {
                      e.stopPropagation();
                      onSelectEvent(ev);
                    }}
                    style={{
                      padding: '2px 6px',
                      borderRadius: 4,
                      background: ev.color || '#3b82f6',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      lineHeight: 1.3,
                    }}
                  >
                    {ev.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
