import { css } from '@emotion/css';

export const calloutHostStyles = css({
  display: 'block',
  margin: '8px 0',
});

export const calloutBlockContainerStyles = css({
  display: 'flex',
  alignItems: 'flex-start',
  padding: '10px 14px',
  borderRadius: '10px',
  border: '1px solid var(--affine-border-color, rgba(0, 0, 0, 0.06))',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
  transition: 'box-shadow 0.2s ease, border-color 0.2s ease',
  ':hover': {
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
  },
});

export const calloutEmojiContainerStyles = css({
  userSelect: 'none',
  fontSize: '1.2em',
  width: '24px',
  height: '24px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  // marginTop is dynamically set by JavaScript based on first child's height
  marginBottom: '10px',
  flexShrink: 0,
  position: 'relative',
});

export const calloutEmojiStyles = css({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'transform 0.15s ease, opacity 0.15s ease',
  ':hover': {
    cursor: 'pointer',
    transform: 'scale(1.1)',
    opacity: 0.85,
  },
});

export const calloutChildrenStyles = css({
  flex: 1,
  minWidth: 0,
  paddingLeft: '12px',
});

export const iconPickerContainerStyles = css({
  position: 'absolute',
  top: '100%',
  left: 0,
  zIndex: 1000,
  background: 'white',
  border: '1px solid #ccc',
  borderRadius: '8px',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  width: '390px',
  height: '400px',
});
