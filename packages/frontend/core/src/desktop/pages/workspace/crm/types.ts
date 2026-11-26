export type CrmDealStage =
  | 'lead'
  | 'qualified'
  | 'proposal'
  | 'negotiation'
  | 'won'
  | 'lost';

export interface CrmDeal {
  id: string;
  workspaceId: string;
  title: string;
  value: number;
  currency: string;
  stage: CrmDealStage;
  contactId?: string;
  contactName?: string;
  probability: number; // 0-100
  expectedCloseDate: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CrmContact {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  stage?: string;
  assignedTo?: string;
  value?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AtsStage =
  | 'sourced'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected';

export interface AtsCandidate {
  id: string;
  workspaceId: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  stage: AtsStage;
  resumeUrl?: string;
  rating: number; // 1-5
  notes?: string;
  roomId?: string;
  roomName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ColumnConfig<T extends string> {
  id: T;
  label: string;
  color: string;
  badgeBg: string;
}

export const CRM_STAGES: ColumnConfig<CrmDealStage>[] = [
  { id: 'lead', label: 'New Lead', color: '#94a3b8', badgeBg: 'rgba(148, 163, 184, 0.15)' },
  { id: 'qualified', label: 'Qualified', color: '#3b82f6', badgeBg: 'rgba(59, 130, 246, 0.15)' },
  { id: 'proposal', label: 'Proposal Sent', color: '#8b5cf6', badgeBg: 'rgba(139, 92, 246, 0.15)' },
  { id: 'negotiation', label: 'Negotiation', color: '#f59e0b', badgeBg: 'rgba(245, 158, 11, 0.15)' },
  { id: 'won', label: 'Closed Won', color: '#10b981', badgeBg: 'rgba(16, 185, 129, 0.15)' },
  { id: 'lost', label: 'Closed Lost', color: '#ef4444', badgeBg: 'rgba(239, 68, 68, 0.15)' },
];

export const ATS_STAGES: ColumnConfig<AtsStage>[] = [
  { id: 'sourced', label: 'Sourced', color: '#94a3b8', badgeBg: 'rgba(148, 163, 184, 0.15)' },
  { id: 'screening', label: 'Screening', color: '#3b82f6', badgeBg: 'rgba(59, 130, 246, 0.15)' },
  { id: 'interview', label: 'Interview', color: '#8b5cf6', badgeBg: 'rgba(139, 92, 246, 0.15)' },
  { id: 'offer', label: 'Offer Extended', color: '#f59e0b', badgeBg: 'rgba(245, 158, 11, 0.15)' },
  { id: 'hired', label: 'Hired', color: '#10b981', badgeBg: 'rgba(16, 185, 129, 0.15)' },
  { id: 'rejected', label: 'Rejected', color: '#ef4444', badgeBg: 'rgba(239, 68, 68, 0.15)' },
];
