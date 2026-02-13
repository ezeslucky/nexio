import { cssVarV2 } from '@toeverything/theme/v2';
import { globalStyle, style } from '@vanilla-extract/css';

export const root = style({
  containerType: 'inline-size',
});

export const editor = style({
  vars: {
    '--nexio-editor-side-padding': '96px',
  },
  minHeight: '100%',
});

globalStyle(`[data-full-width-layout="true"] ${editor}`, {
  vars: {
    '--nexio-editor-width': '100%',
    '--nexio-editor-side-padding': '72px',
  },
});

export const nexioDocViewport = style({
  display: 'flex',
  flexDirection: 'column',
  userSelect: 'none',
  containerName: 'viewport',
  containerType: 'inline-size',
  background: cssVarV2('layer/background/primary'),
});
