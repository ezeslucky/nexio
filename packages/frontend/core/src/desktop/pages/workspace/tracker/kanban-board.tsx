import {
  type ColumnConfig,
  type IssueStatus,
  TRACKER_COLUMNS,
  type TrackerIssue,
} from './types';

interface KanbanBoardProps {
  issues: TrackerIssue[];
  columns?: ColumnConfig[];
  onSelectIssue: (issue: TrackerIssue) => void;
  onStatusChange: (issueId: string, status: IssueStatus) => void;
}

export const KanbanBoard = ({
  issues,
  columns = TRACKER_COLUMNS.filter(c => c.id !== 'canceled'),
  onSelectIssue,
  onStatusChange,
}: KanbanBoardProps) => {
  return (
    <div
      className="huly-scroll"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns.length}, minmax(280px, 1fr))`,
        gap: 16,
        alignItems: 'start',
        flex: 1,
        overflowX: 'auto',
        paddingBottom: 24,
      }}
    >
      {columns.map(column => {
        const columnIssues = issues.filter(i => i.status === column.id);

        return (
          <div
            key={column.id}
            style={{
              background: 'var(--huly-bg-surface, rgba(18, 21, 29, 0.72))',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
              borderRadius: 12,
              border: '1px solid var(--huly-border, rgba(255, 255, 255, 0.08))',
              padding: 12,
              minHeight: 480,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
            }}
          >
            {/* Column Header */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: 8,
                borderBottom: '1px solid var(--huly-border, rgba(255, 255, 255, 0.08))',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: column.color }} />
                <span style={{ fontWeight: 600, fontSize: 13 }}>{column.label}</span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--affine-text-secondary-color, #a1a1aa)',
                  background: 'rgba(0, 0, 0, 0.3)',
                  padding: '2px 6px',
                  borderRadius: 10,
                  fontWeight: 600,
                }}
              >
                {columnIssues.length}
              </span>
            </div>

            {/* Column Cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {columnIssues.map(issue => (
                <div
                  key={issue.id}
                  className="huly-card"
                  onClick={() => onSelectIssue(issue)}
                  style={{
                    padding: 14,
                    cursor: 'pointer',
                  }}
                >
                  {/* Top row: ID & Priority */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--affine-primary-color, #3b82f6)' }}>
                      {issue.id}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        textTransform: 'uppercase',
                        fontWeight: 700,
                        padding: '2px 6px',
                        borderRadius: 4,
                        background:
                          issue.priority === 'urgent'
                            ? '#ef444422'
                            : issue.priority === 'high'
                            ? '#f59e0b22'
                            : '#3b82f622',
                        color:
                          issue.priority === 'urgent'
                            ? '#ef4444'
                            : issue.priority === 'high'
                            ? '#f59e0b'
                            : '#3b82f6',
                      }}
                    >
                      {issue.priority}
                    </span>
                  </div>

                  {/* Title */}
                  <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>
                    {issue.title}
                  </div>

                  {/* Description preview */}
                  {issue.description && (
                    <div
                      style={{
                        fontSize: 12,
                        color: 'var(--affine-text-secondary-color, #a1a1aa)',
                        marginBottom: 10,
                        lineHeight: 1.3,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {issue.description}
                    </div>
                  )}

                  {/* Bottom row: Labels, Estimate & Move Selector */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      paddingTop: 8,
                      borderTop: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {issue.labels?.map(l => (
                        <span
                          key={l}
                          style={{
                            fontSize: 10,
                            background: 'var(--affine-background-secondary-color, #27272a)',
                            padding: '2px 6px',
                            borderRadius: 4,
                            color: 'var(--affine-text-secondary-color, #a1a1aa)',
                          }}
                        >
                          {l}
                        </span>
                      ))}
                      {issue.estimate > 0 && (
                        <span
                          style={{
                            fontSize: 10,
                            padding: '2px 5px',
                            borderRadius: 4,
                            background: 'rgba(59,130,246,0.1)',
                            color: '#3b82f6',
                            fontWeight: 600,
                          }}
                        >
                          {issue.estimate}p
                        </span>
                      )}
                    </div>

                    <select
                      value={issue.status}
                      onClick={e => e.stopPropagation()}
                      onChange={e => onStatusChange(issue.id, e.target.value as IssueStatus)}
                      style={{
                        fontSize: 10,
                        padding: '2px 4px',
                        borderRadius: 4,
                        background: 'transparent',
                        border: '1px solid var(--affine-border-color, #3f3f46)',
                        color: 'var(--affine-text-secondary-color, #a1a1aa)',
                        cursor: 'pointer',
                      }}
                    >
                      {TRACKER_COLUMNS.map(c => (
                        <option key={c.id} value={c.id}>
                          Move: {c.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};
