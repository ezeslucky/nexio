import { cssVar } from '@ezeslucky/theme';
import { style } from '@vanilla-extract/css';
export const headerMenuTrigger = style({
  selectors: {
    '&[data-state=open]': {
      backgroundColor: cssVar('hoverColor'),
    },
  },
});
