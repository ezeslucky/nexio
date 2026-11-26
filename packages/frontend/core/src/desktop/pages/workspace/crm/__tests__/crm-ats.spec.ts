import { describe, expect, it } from 'vitest';
import type { AtsCandidate, AtsStage, CrmDeal, CrmDealStage } from '../types';

export function calculateCrmMetrics(deals: CrmDeal[]): {
  totalValue: number;
  wonValue: number;
  activeCount: number;
  winRate: number;
} {
  const totalValue = deals.reduce((sum, d) => sum + (d.value || 0), 0);
  const wonDeals = deals.filter(d => d.stage === 'won');
  const wonValue = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const closedCount = deals.filter(d => d.stage === 'won' || d.stage === 'lost').length;
  const winRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;
  const activeCount = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost').length;

  return { totalValue, wonValue, activeCount, winRate };
}

export function filterDealsByQuery(deals: CrmDeal[], query: string): CrmDeal[] {
  if (!query.trim()) return deals;
  const q = query.toLowerCase();
  return deals.filter(
    d =>
      d.title.toLowerCase().includes(q) ||
      d.contactName?.toLowerCase().includes(q) ||
      d.notes?.toLowerCase().includes(q)
  );
}

export function filterCandidatesByStage(
  candidates: AtsCandidate[],
  stage?: AtsStage | 'all'
): AtsCandidate[] {
  if (!stage || stage === 'all') return candidates;
  return candidates.filter(c => c.stage === stage);
}

describe('CRM & ATS Pipelines (Huly Parity)', () => {
  describe('CRM Deal Pipeline Calculations', () => {
    const mockDeals: CrmDeal[] = [
      {
        id: 'deal-1',
        workspaceId: 'ws-1',
        title: 'Acme Enterprise License',
        value: 50000,
        currency: 'USD',
        stage: 'proposal',
        contactName: 'Sarah Chen (Acme)',
        probability: 70,
        expectedCloseDate: '2026-12-15T00:00:00Z',
      },
      {
        id: 'deal-2',
        workspaceId: 'ws-1',
        title: 'Horizon Robotics Mesh Network',
        value: 100000,
        currency: 'USD',
        stage: 'won',
        contactName: 'Marcus Vance',
        probability: 100,
        expectedCloseDate: '2026-11-20T00:00:00Z',
      },
      {
        id: 'deal-3',
        workspaceId: 'ws-1',
        title: 'Starlight Labs Seed Plan',
        value: 20000,
        currency: 'USD',
        stage: 'lost',
        probability: 0,
        expectedCloseDate: '2026-11-10T00:00:00Z',
      },
    ];

    it('calculates total pipeline value and closed won revenue correctly', () => {
      const metrics = calculateCrmMetrics(mockDeals);

      expect(metrics.totalValue).toBe(170000);
      expect(metrics.wonValue).toBe(100000);
      expect(metrics.activeCount).toBe(1);
    });

    it('computes win rate percentage across closed deals', () => {
      const metrics = calculateCrmMetrics(mockDeals);
      // 1 won out of 2 closed (won + lost) = 50%
      expect(metrics.winRate).toBe(50);
    });

    it('filters deals by keyword and customer name', () => {
      expect(filterDealsByQuery(mockDeals, 'Acme')).toHaveLength(1);
      expect(filterDealsByQuery(mockDeals, 'Horizon')).toHaveLength(1);
      expect(filterDealsByQuery(mockDeals, 'NonExistent')).toHaveLength(0);
    });
  });

  describe('ATS Candidate Evaluations', () => {
    const mockCandidates: AtsCandidate[] = [
      {
        id: 'cand-1',
        workspaceId: 'ws-1',
        name: 'Elena Rostova',
        email: 'elena@gmail.com',
        role: 'Staff Distributed Systems Engineer',
        stage: 'interview',
        rating: 5,
        roomId: 'room-war-room',
        roomName: 'Dev War Room',
      },
      {
        id: 'cand-2',
        workspaceId: 'ws-1',
        name: 'Devon Zhao',
        email: 'devon@outlook.com',
        role: 'Senior Frontend Architect',
        stage: 'screening',
        rating: 4,
      },
      {
        id: 'cand-3',
        workspaceId: 'ws-1',
        name: 'Chloe Dupont',
        email: 'chloe@design.co',
        role: 'Product Designer',
        stage: 'offer',
        rating: 5,
      },
    ];

    it('filters candidates by evaluation stage', () => {
      expect(filterCandidatesByStage(mockCandidates, 'interview')).toHaveLength(1);
      expect(filterCandidatesByStage(mockCandidates, 'offer')).toHaveLength(1);
      expect(filterCandidatesByStage(mockCandidates, 'all')).toHaveLength(3);
    });

    it('identifies candidates with scheduled virtual office interview rooms', () => {
      const withRoom = mockCandidates.filter(c => !!c.roomId);
      expect(withRoom).toHaveLength(1);
      expect(withRoom[0].name).toBe('Elena Rostova');
      expect(withRoom[0].roomName).toBe('Dev War Room');
    });
  });
});
