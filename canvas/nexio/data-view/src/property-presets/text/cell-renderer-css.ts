import { css } from '@emotion/css';
import { baseTheme } from '@toeverything/theme';

export const textStyle = css({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  width: '100%',
  padding: '0',
  border: 'none',
  fontFamily: baseTheme.fontSansFamily,
  fontSize: 'var(--nexio-font-base)',
  lineHeight: 'var(--nexio-line-height)',
  color: 'var(--nexio-text-primary-color)',
  fontWeight: '400',
  backgroundColor: 'transparent',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
});

export const textInputStyle = css({
  display: 'flex',
  alignItems: 'center',
  height: '100%',
  width: '100%',
  padding: '0',
  border: 'none',
  fontFamily: baseTheme.fontSansFamily,
  fontSize: 'var(--nexio-font-base)',
  lineHeight: 'var(--nexio-line-height)',
  color: 'var(--nexio-text-primary-color)',
  fontWeight: '400',
  backgroundColor: 'transparent',
  cursor: 'text',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap',
  ':focus': {
    outline: 'none',
  },
});
