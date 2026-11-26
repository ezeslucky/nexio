import { notify } from '@nexio/component/ui/notification';
import { useCallback, useState } from 'react';

import { ATS_STAGES, type AtsCandidate, type AtsStage } from './types';

interface CandidateModalProps {
  candidate: Partial<AtsCandidate> | null;
  rooms: Array<{ id: string; name: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSave: (candidate: Partial<AtsCandidate>) => Promise<void>;
  onDelete?: (candidateId: string) => Promise<void>;
}

export const CandidateModal = ({
  candidate,
  rooms,
  isOpen,
  onClose,
  onSave,
  onDelete,
}: CandidateModalProps) => {
  if (!isOpen || !candidate) return null;

  const [name, setName] = useState(candidate.name || '');
  const [email, setEmail] = useState(candidate.email || '');
  const [phone, setPhone] = useState(candidate.phone || '');
  const [role, setRole] = useState(candidate.role || '');
  const [stage, setStage] = useState<AtsStage>(candidate.stage || 'sourced');
  const [rating, setRating] = useState(candidate.rating || 3);
  const [roomId, setRoomId] = useState(candidate.roomId || '');
  const [resumeUrl, setResumeUrl] = useState(candidate.resumeUrl || '');
  const [notes, setNotes] = useState(candidate.notes || '');
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = !!candidate.id;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!name.trim()) {
        notify.warning({ title: 'Name Required', message: 'Please enter candidate name.' });
        return;
      }
      if (!role.trim()) {
        notify.warning({ title: 'Role Required', message: 'Please enter target role.' });
        return;
      }

      setIsSaving(true);
      try {
        const roomObj = rooms.find(r => r.id === roomId);
        await onSave({
          ...candidate,
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          role: role.trim(),
          stage,
          rating: Number(rating) || 3,
          roomId: roomId || undefined,
          roomName: roomObj?.name,
          resumeUrl: resumeUrl.trim() || undefined,
          notes: notes.trim(),
        });
        onClose();
      } catch {
        notify.error({ title: 'Error', message: 'Failed to save candidate.' });
      } finally {
        setIsSaving(false);
      }
    },
    [name, email, phone, role, stage, rating, roomId, rooms, resumeUrl, notes, candidate, onSave, onClose]
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
            <span style={{ fontSize: 18 }}>🎓</span>
            <span style={{ fontSize: 15, fontWeight: 700 }}>
              {isEditing ? 'Candidate Evaluation' : 'Add Candidate to Pipeline'}
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
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Full Name</label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Alex Morgan"
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
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Target Role</label>
              <input
                type="text"
                value={role}
                onChange={e => setRole(e.target.value)}
                placeholder="e.g. Staff Backend Engineer"
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
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Evaluation Stage</label>
              <select
                value={stage}
                onChange={e => setStage(e.target.value as AtsStage)}
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
                {ATS_STAGES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="alex@example.com"
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
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Rating (Stars)</label>
              <select
                value={rating}
                onChange={e => setRating(Number(e.target.value))}
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
                <option value={5}>★★★★★ (Exceptional)</option>
                <option value={4}>★★★★☆ (Strong Hire)</option>
                <option value={3}>★★★☆☆ (Meets Bar)</option>
                <option value={2}>★★☆☆☆ (Questionable)</option>
                <option value={1}>★☆☆☆☆ (Strong No Hire)</option>
              </select>
            </div>
          </div>

          {/* Virtual Office Room Link */}
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
              Interview Virtual Office Room
            </label>
            <select
              value={roomId}
              onChange={e => setRoomId(e.target.value)}
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
              <option value="">No Live Interview Room Assigned</option>
              {rooms.map(r => (
                <option key={r.id} value={r.id}>
                  🏢 {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>Interview & Debrief Notes</label>
            <textarea
              rows={3}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="System design feedback, behavioral signals, compensation expectations..."
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
                  if (confirm('Delete this candidate?')) {
                    await onDelete(candidate.id!);
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
                Delete Candidate
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
                {isSaving ? 'Saving...' : 'Save Candidate'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
