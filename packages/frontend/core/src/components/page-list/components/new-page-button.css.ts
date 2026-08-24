import { cssVar } from '@ezeslucky/theme';
import { cssVarV2 } from '@ezeslucky/theme/v2';
import { style } from '@vanilla-extract/css';
export const menuContent = style({
  backgroundColor: cssVar('backgroundOverlayPanelColor'),
});
export const button = style({
  backgroundColor: cssVarV2.button.secondary,
});
