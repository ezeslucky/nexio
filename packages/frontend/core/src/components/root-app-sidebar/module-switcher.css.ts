import { style } from '@vanilla-extract/css';

export const switcherContainer = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 4,
  padding: '4px',
  margin: '6px 0 10px 0',
  borderRadius: 12,
  background: 'rgba(14, 17, 23, 0.75)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 4px 16px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 0 rgba(255, 255, 255, 0.08)',
});

export const switcherItem = style({
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 32,
  borderRadius: 8,
  border: 'none',
  background: 'transparent',
  color: 'var(--affine-text-secondary-color, #94a3b8)',
  cursor: 'pointer',
  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
  position: 'relative',
  ':hover': {
    background: 'rgba(255, 255, 255, 0.07)',
    color: '#f8fafc',
    transform: 'translateY(-1px)',
  },
  ':active': {
    transform: 'scale(0.95)',
  },
});

export const switcherItemActive = style({
  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.22), rgba(139, 92, 246, 0.16)) !important',
  color: '#818cf8 !important',
  boxShadow: '0 2px 8px -1px rgba(99, 102, 241, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
  border: '1px solid rgba(99, 102, 241, 0.35)',
  fontWeight: 600,
});

export const badge = style({
  position: 'absolute',
  top: 5,
  right: 5,
  width: 6,
  height: 6,
  borderRadius: '50%',
  background: '#6366f1',
  boxShadow: '0 0 8px #6366f1',
});

export const divider = style({
  width: 1,
  height: 18,
  background: 'var(--affine-border-color, rgba(255, 255, 255, 0.12))',
  margin: '0 2px',
  flexShrink: 0,
});
