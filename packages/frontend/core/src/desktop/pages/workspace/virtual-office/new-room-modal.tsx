import { Modal } from '@nexio/component';
import { useState } from 'react';

import type { OfficeRoomType } from './types';

interface NewRoomModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (room: {
    name: string;
    type: OfficeRoomType;
    description: string;
    capacity: number;
  }) => Promise<void>;
}

export const NewRoomModal = ({
  open,
  onClose,
  onCreate,
}: NewRoomModalProps) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<OfficeRoomType>('meeting');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState(8);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    try {
      await onCreate({
        name: name.trim(),
        type,
        description: description.trim(),
        capacity: Number(capacity) || 8,
      });
      setName('');
      setDescription('');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onOpenChange={isOpen => !isOpen && onClose()} width={460}>
      <div style={{ padding: '24px 28px', color: 'var(--affine-text-primary-color)' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px 0' }}>
          Create New Office Room
        </h2>
        <p
          style={{
            fontSize: 13,
            color: 'var(--affine-text-secondary-color)',
            margin: '0 0 20px 0',
          }}
        >
          Add a designated space for pair programming, team meetings, or silent focus.
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                color: 'var(--affine-text-secondary-color)',
              }}
            >
              Room Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Design Critique Room"
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid var(--affine-border-color, #27272a)',
                background: 'var(--affine-background-secondary-color, #18181b)',
                color: 'inherit',
                fontSize: 13,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                color: 'var(--affine-text-secondary-color)',
              }}
            >
              Room Type
            </label>
            <select
              value={type}
              onChange={e => setType(e.target.value as OfficeRoomType)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid var(--affine-border-color, #27272a)',
                background: 'var(--affine-background-secondary-color, #18181b)',
                color: 'inherit',
                fontSize: 13,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            >
              <option value="open_lounge">☕ Open Lounge (Casual & Hangouts)</option>
              <option value="meeting">🎙️ Meeting Room (Standups & Discussions)</option>
              <option value="pair_programming">💻 Pair Programming (Screen & Code Sync)</option>
              <option value="focus">🎧 Focus Pod (Quiet & Muted)</option>
            </select>
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                color: 'var(--affine-text-secondary-color)',
              }}
            >
              Description
            </label>
            <textarea
              rows={2}
              placeholder="What is this room used for?"
              value={description}
              onChange={e => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid var(--affine-border-color, #27272a)',
                background: 'var(--affine-background-secondary-color, #18181b)',
                color: 'inherit',
                fontSize: 13,
                boxSizing: 'border-box',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>

          <div>
            <label
              style={{
                display: 'block',
                fontSize: 12,
                fontWeight: 600,
                marginBottom: 6,
                color: 'var(--affine-text-secondary-color)',
              }}
            >
              Capacity (Occupants)
            </label>
            <input
              type="number"
              min={2}
              max={50}
              value={capacity}
              onChange={e => setCapacity(Number(e.target.value))}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: 8,
                border: '1px solid var(--affine-border-color, #27272a)',
                background: 'var(--affine-background-secondary-color, #18181b)',
                color: 'inherit',
                fontSize: 13,
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: 8,
                border: '1px solid var(--affine-border-color, #27272a)',
                background: 'transparent',
                color: 'inherit',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              style={{
                padding: '8px 18px',
                borderRadius: 8,
                border: 'none',
                background: 'var(--affine-primary-color, #3b82f6)',
                color: '#fff',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                opacity: loading || !name.trim() ? 0.6 : 1,
              }}
            >
              {loading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
};
