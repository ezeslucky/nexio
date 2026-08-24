import { bodyEmphasized, bodyRegular } from '@ezeslucky/theme/typography';
import { cssVarV2 } from '@ezeslucky/theme/v2';
import { style } from '@vanilla-extract/css';

export const title = style([
  bodyEmphasized,
  {
    padding: '11px 20px',
  },
]);

export const empty = style([
  bodyRegular,
  {
    padding: '11px 20px',
    color: cssVarV2('text/placeholder'),
  },
]);
