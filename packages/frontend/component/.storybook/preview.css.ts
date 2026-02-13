import { globalStyle } from '@vanilla-extract/css';

globalStyle('*', {
  margin: 0,
  padding: 0,
});

globalStyle('body', {
  color: 'var(--nexio-text-primary-color)',
  fontFamily: 'var(--nexio-font-family)',
  fontSize: 'var(--nexio-font-base)',
  lineHeight: 'var(--nexio-font-height)',
  backgroundColor: 'var(--nexio-background-primary-color)',
});

globalStyle('.docs-story', {
  backgroundColor: 'var(--nexio-background-primary-color)',
});

globalStyle('body.sb-main-fullscreen', {
  overflowY: 'auto',
});
