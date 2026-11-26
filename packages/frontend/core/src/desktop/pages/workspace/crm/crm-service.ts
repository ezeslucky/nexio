import type { AtsCandidate, CrmContact, CrmDeal } from './types';

export class CrmApiService {
  private static baseUrl = '/api/workspaces';

  // CRM Contacts
  static async getContacts(workspaceId: string): Promise<CrmContact[]> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/crm/contacts`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.contacts || [];
  }

  static async createContact(workspaceId: string, contact: Partial<CrmContact>): Promise<CrmContact> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/crm/contacts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact),
    });
    if (!res.ok) throw new Error('Failed to create contact');
    return await res.json();
  }

  // CRM Deals
  static async getDeals(workspaceId: string): Promise<CrmDeal[]> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/crm/deals`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.deals || [];
  }

  static async createDeal(workspaceId: string, deal: Partial<CrmDeal>): Promise<CrmDeal> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/crm/deals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(deal),
    });
    if (!res.ok) throw new Error('Failed to create deal');
    return await res.json();
  }

  static async updateDeal(workspaceId: string, dealId: string, updates: Partial<CrmDeal>): Promise<CrmDeal> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/crm/deals/${dealId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update deal');
    return await res.json();
  }

  static async deleteDeal(workspaceId: string, dealId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/crm/deals/${dealId}`, {
      method: 'DELETE',
    });
    return res.ok;
  }

  // ATS Candidates
  static async getCandidates(workspaceId: string): Promise<AtsCandidate[]> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/ats/candidates`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.candidates || [];
  }

  static async createCandidate(workspaceId: string, candidate: Partial<AtsCandidate>): Promise<AtsCandidate> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/ats/candidates`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(candidate),
    });
    if (!res.ok) throw new Error('Failed to create candidate');
    return await res.json();
  }

  static async updateCandidate(
    workspaceId: string,
    candidateId: string,
    updates: Partial<AtsCandidate>
  ): Promise<AtsCandidate> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/ats/candidates/${candidateId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update candidate');
    return await res.json();
  }

  static async deleteCandidate(workspaceId: string, candidateId: string): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/${workspaceId}/ats/candidates/${candidateId}`, {
      method: 'DELETE',
    });
    return res.ok;
  }
}
