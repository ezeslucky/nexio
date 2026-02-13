import { style } from '@vanilla-extract/css';
export const editor = style({
  flex: 1,
  selectors: {
    '&.full-screen': {
      vars: {
        '--nexio-editor-width': '100%',
        '--nexio-editor-side-padding': '72px',
      },
    },
  },
  '@media': {
    'screen and (max-width: 800px)': {
      selectors: {
        '&.is-public': {
          vars: {
            '--nexio-editor-width': '100%',
            '--nexio-editor-side-padding': '24px',
          },
        },
      },
    },
  },
});
