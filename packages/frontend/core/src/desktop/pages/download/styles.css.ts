import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { style } from '@vanilla-extract/css';

export const container = style({
  width: '100%',
  maxWidth: '840px',
  margin: '0 auto',
  padding: '80px 24px 60px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const header = style({
  textAlign: 'center',
  marginBottom: '32px',
});

export const title = style({
  fontSize: '36px',
  fontWeight: 700,
  lineHeight: '44px',
  color: cssVarV2('text/primary'),
  marginBottom: '12px',
  '@media': {
    'screen and (max-width: 640px)': {
      fontSize: '28px',
      lineHeight: '34px',
    },
  },
});

export const subtitle = style({
  fontSize: cssVar('fontBase'),
  color: cssVarV2('text/secondary'),
  maxWidth: '560px',
  lineHeight: '1.6',
});

export const contentWrapper = style({
  width: '100%',
  background: cssVarV2('layer/background/primary'),
  borderRadius: '16px',
  border: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
  padding: '24px',
  boxShadow: '0 8px 30px rgba(0, 0, 0, 0.04)',
});
