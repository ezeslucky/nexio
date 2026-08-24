import { cssVar } from '@ezeslucky/theme';
import { style } from '@vanilla-extract/css';

export const errorMessage = style({
  color: cssVar('errorColor'),
});
