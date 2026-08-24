import { cssVar } from '@ezeslucky/theme';
import { style } from '@vanilla-extract/css';

export const errorMessage = style({
  color: cssVar('--nexio-error-color'),
  fontSize: '0.6rem',
  margin: '4px 8px 2px 2px',
});
