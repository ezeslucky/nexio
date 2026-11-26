import {
  type IssueStatus,
  TRACKER_COLUMNS,
  type TrackerIssue,
} from './types';

interface IssueListViewProps {
  issues: TrackerIssue[];
  onSelectIssue: (issue: TrackerIssue) => void;
  onStatusChange: (issueId: string, status: IssueStatus) => void;
}

export const IssueListView = ({
  issues,
  onSelectIssue,
  onStatusChange,
}: IssueListViewProps) => {
  return (
    <div
      style={{
        background: 'var(--affine-background-secondary-color, #18181b)',
        borderRadius: 12,
        border: '1px solid var(--affine-border-color, #27272a)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '90px 1fr 140px 110px 80px 140px 110px',
          padding: '12px 18px',
          fontWeight: 600,
          fontSize: 12,
          color: 'var(--affine-text-secondary-color, #a1a1aa)',
          borderBottom: '1px solid var(--affine-border-color, #27272a)',
          background: 'rgba(255, 255, 255, 0.02)',
        }}
      >
        <div>ID</div>
        <div>Title</div>
        <div>Status</div>
        <div>Priority</div>
        <div>Estimate</div>
        <div>Assignee</div>
        <div>Due Date</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {issues.map(issue => {
          const col = TRACKER_COLUMNS.find(c => c.id === issue.status);

          return (
            <div
              key={issue.id}
              onClick={() => onSelectIssue(issue)}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1fr 140px 110px 80px 140px 110px',
                padding: '12px 18px',
                fontSize: 13,
                alignItems: 'center',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                cursor: 'pointer',
                transition: 'background 0.15s ease',
              }}
            >
              <div style={{ fontWeight: 700, color: 'var(--affine-primary-color, #3b82f6)', fontSize: 12 }}>
                {issue.id}
              </div>

              <div style={{ fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: 12 }}>
                {issue.title}
              </div>

              <div onClick={e => e.stopPropagation()}>
                <select
                  value={issue.status}
                  onChange={e => onStatusChange(issue.id, e.target.value as IssueStatus)}
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    background: col?.badgeBg || 'rgba(255,255,255,0.06)',
                    color: col?.color || '#fff',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                >
                  {TRACKER_COLUMNS.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color:
                      issue.priority === 'urgent'
                        ? '#ef4444'
                        : issue.priority === 'high'
                        ? '#f59e0b'
                        : issue.priority === 'medium'
                        ? '#3b82f6'
                        : '#a1a1aa',
                  }}
                >
                  {issue.priority}
                </span>
              </div>

              <div style={{ color: 'var(--affine-text-secondary-color, #a1a1aa)', fontSize: 12 }}>
                {issue.estimate ? `${issue.estimate} pts` : '-'}
              </div>

              <div style={{ color: 'var(--affine-text-secondary-color, #a1a1aa)', fontSize: 12 }}>
                {issue.assignee || 'Unassigned'}
              </div>

              <div style={{ color: 'var(--affine-text-secondary-color, #a1a1aa)', fontSize: 12 }}>
                {issue.dueDate || '-'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
