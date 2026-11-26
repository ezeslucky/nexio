import { CRM_STAGES, type CrmDeal, type CrmDealStage } from './types';

interface CrmKanbanProps {
  deals: CrmDeal[];
  onSelectDeal: (deal: CrmDeal) => void;
  onMoveStage: (dealId: string, nextStage: CrmDealStage) => void;
}

export const CrmKanban = ({ deals, onSelectDeal, onMoveStage }: CrmKanbanProps) => {
  // Aggregate Metrics
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const wonDeals = deals.filter(d => d.stage === 'won');
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const closedCount = deals.filter(d => d.stage === 'won' || d.stage === 'lost').length;
  const winRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top Metrics Banner */}
      <div
        className="huly-glass-panel"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          padding: '14px 20px',
          borderBottom: '1px solid var(--huly-border, rgba(255, 255, 255, 0.08))',
        }}
      >
        <div className="huly-card" style={{ padding: '10px 14px', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#a1a1aa' }}>Total Pipeline Value</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#6366f1', marginTop: 2 }}>
            ${totalValue.toLocaleString()}
          </div>
        </div>
        <div className="huly-card" style={{ padding: '10px 14px', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#a1a1aa' }}>Closed Won Revenue</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#10b981', marginTop: 2 }}>
            ${wonValue.toLocaleString()}
          </div>
        </div>
        <div className="huly-card" style={{ padding: '10px 14px', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#a1a1aa' }}>Win Rate</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b', marginTop: 2 }}>
            {winRate}%
          </div>
        </div>
        <div className="huly-card" style={{ padding: '10px 14px', borderRadius: 8 }}>
          <div style={{ fontSize: 11, color: '#a1a1aa' }}>Active Deals</div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#a855f7', marginTop: 2 }}>
            {deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length}
          </div>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div
        className="huly-scroll"
        style={{
          flex: 1,
          display: 'flex',
          gap: 12,
          padding: 16,
          overflowX: 'auto',
          background: 'var(--huly-bg-canvas, #090a0f)',
        }}
      >
        {CRM_STAGES.map(col => {
          const colDeals = deals.filter(d => d.stage === col.id);
          const colTotal = colDeals.reduce((sum, d) => sum + (d.value || 0), 0);

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
              {/* Column Header */}
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
                    {colDeals.length}
                  </span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#a1a1aa' }}>
                  ${colTotal.toLocaleString()}
                </span>
              </div>

              {/* Deal Cards */}
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
                {colDeals.map(deal => (
                  <div
                    key={deal.id}
                    className="huly-card"
                    onClick={() => onSelectDeal(deal)}
                    style={{
                      padding: 12,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--affine-text-primary-color, #f4f4f5)' }}>
                        {deal.title}
                      </span>
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: '#10b981',
                        }}
                      >
                        ${deal.value.toLocaleString()}
                      </span>
                    </div>

                    {deal.contactName && (
                      <div style={{ fontSize: 11, color: '#a1a1aa', display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span>👤</span>
                        <span>{deal.contactName}</span>
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
                      <span style={{ color: '#71717a' }}>
                        Close: {deal.expectedCloseDate ? deal.expectedCloseDate.slice(0, 10) : 'TBD'}
                      </span>
                      <span style={{ color: '#60a5fa', fontWeight: 600 }}>
                        {deal.probability}% Prob
                      </span>
                    </div>

                    {/* Move stage quick select */}
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <select
                        value={deal.stage}
                        onClick={e => e.stopPropagation()}
                        onChange={e => onMoveStage(deal.id, e.target.value as CrmDealStage)}
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
                        {CRM_STAGES.map(s => (
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
