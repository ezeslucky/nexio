import { cssVar } from '@ezeslucky/theme';
import { style } from '@vanilla-extract/css';

export const container = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  width: '100%',
  lineHeight: 4,
  color: cssVar('--nexio-text-secondary-color'),
});
