import { notify } from '@nexio/component/ui/notification';
import { useCallback, useState } from 'react';

import { CRM_STAGES, type CrmContact, type CrmDeal, type CrmDealStage } from './types';

interface DealModalProps {
  deal: Partial<CrmDeal> | null;
  contacts: CrmContact[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (deal: Partial<CrmDeal>) => Promise<void>;
  onDelete?: (dealId: string) => Promise<void>;
}

export const DealModal = ({
  deal,
  contacts,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: DealModalProps) => {
  if (!isOpen || !deal) return null;

  const [title, setTitle] = useState(deal.title || '');
  const [value, setValue] = useState(deal.value || 10000);
  const [stage, setStage] = useState<CrmDealStage>(deal.stage || 'lead');
  const [contactId, setContactId] = useState(deal.contactId || '');
  const [probability, setProbability] = useState(deal.probability || 50);
  const [expectedCloseDate, setExpectedCloseDate] = useState(
    deal.expectedCloseDate ? deal.expectedCloseDate.slice(0, 10) : ''
  );
  const [notes, setNotes] = useState(deal.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!deal.id;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!title.trim()) {
        notify.warning({ title: 'Title Required', message: 'Please enter a deal title.' });
        return;
      }

      setIsSaving(true);
      try {
        const contactObj = contacts.find(c => c.id === contactId);
        await onSave({
          ...deal,
          title: title.trim(),
          value: Number(value) || 0,
          currency: 'USD',
          stage,
          contactId: contactId || undefined,
          contactName: contactObj ? `${contactObj.name} (${contactObj.company || 'Client'})` : undefined,
          probability: Number(probability) || 0,
          expectedCloseDate: expectedCloseDate ? `${expectedCloseDate}T00:00:00Z` : '',
          notes: notes.trim(),
        });
        onClose();
      } catch {
        notify.error({ title: 'Error', message: 'Failed to save deal.' });
      } finally {
        setIsSaving(false);
      }
    },
    [title, value, stage, contactId, probability, expectedCloseDate, notes, deal, contacts, onSave, onClose]
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
            <span style={{ fontSize: 18 }}>💼</span>
            <span style={{ fontSize: 15, fontWeight: 700 }}>
              {isEditing ? 'Edit Sales Deal' : 'Create New Sales Deal'}
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

        <form onSubmit={handleSubmit} style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Deal Title</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Enterprise License - Acme Corp"
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
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Value ($ USD)</label>
              <input
                type="number"
                min={0}
                value={value}
                onChange={e => setValue(Number(e.target.value))}
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
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Stage</label>
              <select
                value={stage}
                onChange={e => setStage(e.target.value as CrmDealStage)}
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
                {CRM_STAGES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Associated Contact</label>
              <select
                value={contactId}
                onChange={e => setContactId(e.target.value)}
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
                <option value="">No Contact Linked</option>
                {contacts.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.company || 'Client'})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Win Probability (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={probability}
                onChange={e => setProbability(Number(e.target.value))}
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

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Expected Close Date</label>
            <input
              type="date"
              value={expectedCloseDate}
              onChange={e => setExpectedCloseDate(e.target.value)}
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
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Deal Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Commercial terms, executive sponsors, negotiation updates..."
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

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            {isEditing && onDelete ? (
              <button
                type="button"
                onClick={async () => {
                  if (confirm('Delete this deal?')) {
                    await onDelete(deal.id!);
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
                Delete Deal
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
                {isSaving ? 'Saving...' : 'Save Deal'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
