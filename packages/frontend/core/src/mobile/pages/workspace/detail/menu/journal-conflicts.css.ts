import { cssVar } from '@ezeslucky/theme';
import { cssVarV2 } from '@ezeslucky/theme/v2';
import { style } from '@vanilla-extract/css';

export const docItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: 8,
});

export const duplicateTag = style({
  borderRadius: 4,
  padding: '0 8px',
  fontSize: cssVar('fontXs'),
  lineHeight: '20px',
  color: cssVarV2('toast/iconState/error'),
  background: cssVarV2('layer/background/error'),
  border: `1px solid ${cssVarV2('database/border')}`,
});
