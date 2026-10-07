import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const modalWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
  maxHeight: '75vh',
  overflowY: 'auto',
  padding: '4px 0',
});

export const detectedBanner = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '16px',
  padding: '14px 18px',
  borderRadius: '12px',
  background: cssVarV2('layer/background/hoverOverlay'),
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  '@media': {
    'screen and (max-width: 640px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
    },
  },
});

export const detectedBannerLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

export const detectedIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '40px',
  height: '40px',
  borderRadius: '10px',
  background: cssVarV2('button/primary'),
  color: '#ffffff',
  flexShrink: 0,
});

export const detectedTextTitle = style({
  fontSize: cssVar('fontBase'),
  fontWeight: 600,
  color: cssVarV2('text/primary'),
});

export const detectedTextDesc = style({
  fontSize: cssVar('fontXs'),
  color: cssVarV2('text/secondary'),
  marginTop: '2px',
});

export const tabsWrapper = style({
  display: 'flex',
  gap: '8px',
  borderBottom: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  paddingBottom: '8px',
});

export const tabButton = style({
  padding: '6px 14px',
  borderRadius: '8px',
  fontSize: cssVar('fontSm'),
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
  background: 'transparent',
  color: cssVarV2('text/secondary'),
  transition: 'all 0.2s ease',
  selectors: {
    '&:hover': {
      background: cssVarV2('layer/background/hoverOverlay'),
      color: cssVarV2('text/primary'),
    },
    '&[data-active="true"]': {
      background: cssVarV2('layer/background/hoverOverlay'),
      color: cssVarV2('text/primary'),
      fontWeight: 600,
    },
  },
});

export const sectionTitle = style({
  fontSize: cssVar('fontSm'),
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  color: cssVarV2('text/tertiary'),
  marginTop: '8px',
  marginBottom: '4px',
});

export const platformGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
  gap: '12px',
});

export const platformCard = style({
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '14px',
  padding: '16px',
  borderRadius: '12px',
  background: cssVarV2('layer/background/primary'),
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  ':hover': {
    borderColor: cssVarV2('button/primary'),
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
  },
});

export const cardHeader = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: '12px',
});

export const cardIcon = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '36px',
  height: '36px',
  borderRadius: '8px',
  background: cssVarV2('layer/background/hoverOverlay'),
  color: cssVarV2('text/primary'),
  flexShrink: 0,
});

export const cardInfo = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  flex: 1,
});

export const cardTitle = style({
  fontSize: cssVar('fontBase'),
  fontWeight: 600,
  color: cssVarV2('text/primary'),
});

export const cardSubtitle = style({
  fontSize: cssVar('fontXs'),
  color: cssVarV2('text/secondary'),
});

export const badgeList = style({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '6px',
  marginTop: '6px',
});

export const badge = style({
  padding: '2px 8px',
  borderRadius: '6px',
  fontSize: '11px',
  fontWeight: 500,
  background: cssVarV2('layer/background/hoverOverlay'),
  color: cssVarV2('text/secondary'),
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
});

export const cardActions = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-end',
  gap: '8px',
});

export const footerCard = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '14px 18px',
  borderRadius: '12px',
  background: cssVarV2('layer/background/secondary'),
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  marginTop: '8px',
  '@media': {
    'screen and (max-width: 640px)': {
      flexDirection: 'column',
      alignItems: 'flex-start',
      gap: '10px',
    },
  },
});

export const footerText = style({
  fontSize: cssVar('fontSm'),
  color: cssVarV2('text/secondary'),
});

export const footerLink = style({
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: cssVar('fontSm'),
  fontWeight: 500,
  color: cssVarV2('button/primary'),
  textDecoration: 'none',
  ':hover': {
    textDecoration: 'underline',
  },
});
