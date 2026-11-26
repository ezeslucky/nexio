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

import { AtsKanban } from './ats-kanban';
import { CandidateModal } from './candidate-modal';
import { CrmKanban } from './crm-kanban';
import { CrmApiService } from './crm-service';
import { DealModal } from './deal-modal';
import type { AtsCandidate, AtsStage, CrmContact, CrmDeal, CrmDealStage } from './types';

export const Component = () => {
  const workspaceService = useService(WorkspaceService);
  const currentWorkspace = workspaceService.workspace;
  const workspaceId = currentWorkspace.id;

  const [activeTab, setActiveTab] = useState<'crm' | 'ats'>('crm');
  const [deals, setDeals] = useState<CrmDeal[]>([]);
  const [contacts, setContacts] = useState<CrmContact[]>([]);
  const [candidates, setCandidates] = useState<AtsCandidate[]>([]);
  const [rooms, setRooms] = useState<Array<{ id: string; name: string }>>([]);

  const [search, setSearch] = useState('');
  const [selectedDeal, setSelectedDeal] = useState<Partial<CrmDeal> | null>(null);
  const [isDealModalOpen, setIsDealModalOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<Partial<AtsCandidate> | null>(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);

  // Fetch initial data
  const loadData = useCallback(async () => {
    try {
      const [dealsList, contactsList, candidatesList, roomsRes] = await Promise.all([
        CrmApiService.getDeals(workspaceId).catch(() => []),
        CrmApiService.getContacts(workspaceId).catch(() => []),
        CrmApiService.getCandidates(workspaceId).catch(() => []),
        fetch(`/api/workspaces/${workspaceId}/office/rooms`)
          .then(r => (r.ok ? r.json() : { rooms: [] }))
          .catch(() => ({ rooms: [] })),
      ]);

      setDeals(dealsList);
      setContacts(contactsList);
      setCandidates(candidatesList);
      setRooms(roomsRes.rooms || []);
    } catch {
      notify.error({ title: 'Error', message: 'Failed to load pipeline data' });
    }
  }, [workspaceId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Filtered lists
  const filteredDeals = useMemo(() => {
    if (!search.trim()) return deals;
    const q = search.toLowerCase();
    return deals.filter(
      d =>
        d.title.toLowerCase().includes(q) ||
        d.contactName?.toLowerCase().includes(q) ||
        d.notes?.toLowerCase().includes(q)
    );
  }, [deals, search]);

  const filteredCandidates = useMemo(() => {
    if (!search.trim()) return candidates;
    const q = search.toLowerCase();
    return candidates.filter(
      c =>
        c.name.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
    );
  }, [candidates, search]);

  // Deal handlers
  const handleSaveDeal = async (deal: Partial<CrmDeal>) => {
    if (deal.id) {
      const updated = await CrmApiService.updateDeal(workspaceId, deal.id, deal);
      setDeals(prev => prev.map(d => (d.id === updated.id ? updated : d)));
      notify.success({ title: 'Deal Updated', message: `${deal.title} updated.` });
    } else {
      const created = await CrmApiService.createDeal(workspaceId, deal);
      setDeals(prev => [created, ...prev]);
      notify.success({ title: 'Deal Created', message: `${created.title} added to pipeline.` });
    }
  };

  const handleDeleteDeal = async (dealId: string) => {
    await CrmApiService.deleteDeal(workspaceId, dealId);
    setDeals(prev => prev.filter(d => d.id !== dealId));
    notify.success({ title: 'Deal Deleted', message: 'Deal removed from CRM.' });
  };

  const handleMoveDealStage = async (dealId: string, nextStage: CrmDealStage) => {
    try {
      const updated = await CrmApiService.updateDeal(workspaceId, dealId, { stage: nextStage });
      setDeals(prev => prev.map(d => (d.id === updated.id ? updated : d)));
    } catch {
      notify.error({ title: 'Error', message: 'Failed to advance deal stage.' });
    }
  };

  // Candidate handlers
  const handleSaveCandidate = async (candidate: Partial<AtsCandidate>) => {
    if (candidate.id) {
      const updated = await CrmApiService.updateCandidate(workspaceId, candidate.id, candidate);
      setCandidates(prev => prev.map(c => (c.id === updated.id ? updated : c)));
      notify.success({ title: 'Candidate Updated', message: `${candidate.name} updated.` });
    } else {
      const created = await CrmApiService.createCandidate(workspaceId, candidate);
      setCandidates(prev => [created, ...prev]);
      notify.success({ title: 'Candidate Added', message: `${created.name} added to ATS pipeline.` });
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    await CrmApiService.deleteCandidate(workspaceId, candidateId);
    setCandidates(prev => prev.filter(c => c.id !== candidateId));
    notify.success({ title: 'Candidate Deleted', message: 'Candidate removed from ATS.' });
  };

  const handleMoveCandidateStage = async (candidateId: string, nextStage: AtsStage) => {
    try {
      const updated = await CrmApiService.updateCandidate(workspaceId, candidateId, { stage: nextStage });
      setCandidates(prev => prev.map(c => (c.id === updated.id ? updated : c)));
    } catch {
      notify.error({ title: 'Error', message: 'Failed to advance candidate stage.' });
    }
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
      <ViewTitle title="CRM & ATS Pipelines" />

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
          {/* Left: Tab Switcher (CRM vs ATS) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 20 }}>{activeTab === 'crm' ? '💼' : '🎓'}</span>
              <span style={{ fontSize: 16, fontWeight: 700 }}>
                {activeTab === 'crm' ? 'Sales CRM' : 'Recruiting ATS'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                background: 'var(--affine-background-secondary-color, #27272a)',
                borderRadius: 8,
                padding: 2,
                border: '1px solid var(--affine-border-color, #3f3f46)',
              }}
            >
              <button
                type="button"
                onClick={() => setActiveTab('crm')}
                style={{
                  padding: '5px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: activeTab === 'crm' ? 'var(--affine-primary-color, #3b82f6)' : 'transparent',
                  color: activeTab === 'crm' ? '#fff' : 'var(--affine-text-secondary-color, #a1a1aa)',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>💼 Deals</span>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    padding: '1px 6px',
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                >
                  {deals.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('ats')}
                style={{
                  padding: '5px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: activeTab === 'ats' ? 'var(--affine-primary-color, #3b82f6)' : 'transparent',
                  color: activeTab === 'ats' ? '#fff' : 'var(--affine-text-secondary-color, #a1a1aa)',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <span>🎓 Candidates</span>
                <span
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    padding: '1px 6px',
                    borderRadius: 10,
                    fontSize: 11,
                  }}
                >
                  {candidates.length}
                </span>
              </button>
            </div>
          </div>

          {/* Right: Search and Action Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <input
              type="text"
              placeholder={`Search ${activeTab === 'crm' ? 'deals & accounts' : 'candidates & roles'}...`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 8,
                border: '1px solid var(--affine-border-color, #3f3f46)',
                background: 'var(--affine-background-secondary-color, #27272a)',
                color: 'var(--affine-text-primary-color, #f4f4f5)',
                fontSize: 12,
                width: 220,
              }}
            />

            {activeTab === 'crm' ? (
              <button
                type="button"
                onClick={() => {
                  setSelectedDeal({
                    workspaceId,
                    title: '',
                    value: 15000,
                    currency: 'USD',
                    stage: 'lead',
                    probability: 40,
                  });
                  setIsDealModalOpen(true);
                }}
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
                + New Deal
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSelectedCandidate({
                    workspaceId,
                    name: '',
                    email: '',
                    role: 'Senior Software Engineer',
                    stage: 'sourced',
                    rating: 4,
                  });
                  setIsCandidateModalOpen(true);
                }}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#8b5cf6',
                  color: '#fff',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                + New Candidate
              </button>
            )}
          </div>
        </div>
      </ViewHeader>

      <ViewBody>
        {activeTab === 'crm' ? (
          <CrmKanban
            deals={filteredDeals}
            onSelectDeal={d => {
              setSelectedDeal(d);
              setIsDealModalOpen(true);
            }}
            onMoveStage={handleMoveDealStage}
          />
        ) : (
          <AtsKanban
            candidates={filteredCandidates}
            onSelectCandidate={c => {
              setSelectedCandidate(c);
              setIsCandidateModalOpen(true);
            }}
            onMoveStage={handleMoveCandidateStage}
          />
        )}

        {/* Modals */}
        <DealModal
          deal={selectedDeal}
          contacts={contacts}
          isOpen={isDealModalOpen}
          onClose={() => setIsDealModalOpen(false)}
          onSave={handleSaveDeal}
          onDelete={handleDeleteDeal}
        />

        <CandidateModal
          candidate={selectedCandidate}
          rooms={rooms}
          isOpen={isCandidateModalOpen}
          onClose={() => setIsCandidateModalOpen(false)}
          onSave={handleSaveCandidate}
          onDelete={handleDeleteCandidate}
        />
      </ViewBody>
    </div>
  );
};
