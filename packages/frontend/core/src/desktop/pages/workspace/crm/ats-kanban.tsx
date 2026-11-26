import { ATS_STAGES, type AtsCandidate, type AtsStage } from './types';

interface AtsKanbanProps {
  candidates: AtsCandidate[];
  onSelectCandidate: (candidate: AtsCandidate) => void;
  onMoveStage: (candidateId: string, nextStage: AtsStage) => void;
}

export const AtsKanban = ({
  candidates,
  onSelectCandidate,
  onMoveStage,
}: AtsKanbanProps) => {
  const hiredCount = candidates.filter(c => c.stage === 'hired').length;
  const interviewingCount = candidates.filter(c => c.stage === 'interview' || c.stage === 'screening').length;
  const totalCount = candidates.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* ATS Metrics Banner */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          padding: '14px 20px',
          background: 'var(--affine-background-primary-color, #18181b)',
          borderBottom: '1px solid var(--affine-border-color, #27272a)',
        }}
      >
        <div style={{ background: 'var(--affine-background-secondary-color, #27272a)', padding: '10px 14px', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#a1a1aa' }}>Total Candidates</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6', marginTop: 2 }}>
            {totalCount}
          </div>
        </div>
        <div style={{ background: 'var(--affine-background-secondary-color, #27272a)', padding: '10px 14px', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#a1a1aa' }}>In Active Evaluation</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#8b5cf6', marginTop: 2 }}>
            {interviewingCount}
          </div>
        </div>
        <div style={{ background: 'var(--affine-background-secondary-color, #27272a)', padding: '10px 14px', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#a1a1aa' }}>Offers / Hired</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981', marginTop: 2 }}>
            {hiredCount}
          </div>
        </div>
        <div style={{ background: 'var(--affine-background-secondary-color, #27272a)', padding: '10px 14px', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#a1a1aa' }}>Live Virtual Interviews</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b', marginTop: 2 }}>
            {candidates.filter(c => !!c.roomId).length}
          </div>
        </div>
      </div>

      {/* Columns */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          gap: 12,
          padding: 16,
          overflowX: 'auto',
          background: 'var(--affine-background-primary-color, #18181b)',
        }}
      >
        {ATS_STAGES.map(col => {
          const colCandidates = candidates.filter(c => c.stage === col.id);

          return (
            <div
              key={col.id}
              style={{
                flex: '0 0 280px',
                display: 'flex',
                flexDirection: 'column',
                background: 'var(--affine-background-secondary-color, #27272a)',
                borderRadius: 10,
                border: '1px solid var(--affine-border-color, #3f3f46)',
                overflow: 'hidden',
                maxHeight: '100%',
              }}
            >
              {/* Header */}
              <div
                style={{
                  padding: '12px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  borderBottom: '1px solid var(--affine-border-color, #3f3f46)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: col.color,
                    }}
                  />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{col.label}</span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    padding: '2px 6px',
                    borderRadius: 10,
                    background: col.badgeBg,
                    color: col.color,
                    fontWeight: 600,
                  }}
                >
                  {colCandidates.length}
                </span>
              </div>

              {/* Cards */}
              <div
                style={{
                  flex: 1,
                  padding: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                  overflowY: 'auto',
                }}
              >
                {colCandidates.map(candidate => (
                  <div
                    key={candidate.id}
                    onClick={() => onSelectCandidate(candidate)}
                    style={{
                      background: 'var(--affine-background-primary-color, #18181b)',
                      padding: 12,
                      borderRadius: 8,
                      border: '1px solid var(--affine-border-color, #3f3f46)',
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                      boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--affine-text-primary-color, #f4f4f5)' }}>
                        {candidate.name}
                      </span>
                      <span style={{ color: '#fbbf24', fontSize: 11 }}>
                        {'★'.repeat(candidate.rating || 3)}
                        {'☆'.repeat(Math.max(0, 5 - (candidate.rating || 3)))}
                      </span>
                    </div>

                    <div style={{ fontSize: 12, color: 'var(--affine-primary-color, #3b82f6)', fontWeight: 600 }}>
                      {candidate.role}
                    </div>

                    <div style={{ fontSize: 11, color: '#a1a1aa' }}>
                      {candidate.email}
                    </div>

                    {candidate.roomName && (
                      <div
                        style={{
                          fontSize: 11,
                          padding: '4px 8px',
                          borderRadius: 6,
                          background: 'rgba(139, 92, 246, 0.15)',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          color: '#c4b5fd',
                          display: 'flex',
                          alignItems: 'center',
                          gap: 6,
                        }}
                      >
                        <span>🏢</span>
                        <span>Interview: {candidate.roomName}</span>
                      </div>
                    )}

                    {/* Move stage dropdown */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <select
                        value={candidate.stage}
                        onClick={e => e.stopPropagation()}
                        onChange={e => onMoveStage(candidate.id, e.target.value as AtsStage)}
                        style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 4,
                          background: 'var(--affine-background-secondary-color, #27272a)',
                          border: '1px solid var(--affine-border-color, #3f3f46)',
                          color: '#a1a1aa',
                          cursor: 'pointer',
                        }}
                      >
                        {ATS_STAGES.map(s => (
                          <option key={s.id} value={s.id}>
                            Move to: {s.label}
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
    </div>
  );
};
