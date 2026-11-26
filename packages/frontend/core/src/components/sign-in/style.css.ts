import { cssVar } from '@toeverything/theme';
import { cssVarV2 } from '@toeverything/theme/v2';
import { globalStyle, style } from '@vanilla-extract/css';

export const authMessage = style({
  color: cssVar('textSecondaryColor'),
  fontSize: cssVar('fontXs'),
  lineHeight: '20px',
});

globalStyle(`${authMessage} a`, {
  color: cssVar('linkColor'),
});

globalStyle(`${authMessage} .link`, {
  cursor: 'pointer',
  color: cssVar('linkColor'),
});

export const captchaWrapper = style({
  margin: 'auto',
  marginBottom: '4px',
  textAlign: 'center',
});

export const passwordButtonRow = style({
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '30px',
});

export const linkButton = style({
  color: cssVar('linkColor'),
  background: 'transparent',
  borderColor: 'transparent',
  fontSize: cssVar('fontXs'),
  lineHeight: '22px',
  userSelect: 'none',
});

export const addSelfhostedButton = style({
  color: cssVarV2('text/link'),
});

export const addSelfhostedButtonPrefix = style({
  color: cssVarV2('text/link'),
});

export const skipDivider = style({
  display: 'flex',
  gap: 14,
  alignItems: 'center',
  height: 20,
  margin: '22px 0',
});

export const skipDividerLine = style({
  flex: 1,
  height: 0,
  borderBottom: `1px solid ${cssVarV2('layer/insideBorder/border')}`,
});

export const skipDividerText = style({
  color: cssVarV2('text/secondary'),
  fontSize: cssVar('fontXs'),
});

export const skipText = style({
  color: cssVarV2('text/primary'),
  fontSize: cssVar('fontXs'),
  fontWeight: 500,
});

export const skipLink = style({
  color: cssVarV2('text/link'),
  fontSize: cssVar('fontXs'),
});

export const skipLinkIcon = style({
  color: cssVarV2('text/link'),
});

export const skipSection = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

export const authInput = style({
  backgroundColor: cssVarV2.button.signinbutton.background,
});

export const signInButton = style({
  backgroundColor: cssVarV2.button.signinbutton.background,
});

export const cardContainer = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  backgroundColor: 'var(--affine-background-primary-color, #ffffff)',
  borderRadius: '24px',
  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.05)',
  border: '1px solid var(--affine-border-color, #e5e7eb)',
  padding: '36px 32px 28px',
  boxSizing: 'border-box',
  selectors: {
    '[data-testid="auth-modal"] &': {
      border: 'none',
      boxShadow: 'none',
      padding: '0',
      backgroundColor: 'transparent',
    },
  },
});

export const cardHeading = style({
  fontSize: '26px',
  fontWeight: 700,
  lineHeight: '1.25',
  color: 'var(--affine-text-primary-color, #111827)',
  margin: '0',
  letterSpacing: '-0.02em',
});

export const cardHeadingHighlight = style({
  color: '#ff5757',
  display: 'block',
  fontWeight: 700,
});

export const cardSubtitle = style({
  fontSize: '14px',
  color: 'var(--affine-text-secondary-color, #6b7280)',
  margin: '8px 0 24px 0',
  lineHeight: '1.5',
});

export const googleAuthButton = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  width: '100%',
  height: '52px',
  padding: '0 20px',
  borderRadius: '9999px',
  border: '1px solid var(--affine-border-color, #e5e7eb)',
  backgroundColor: 'var(--affine-background-primary-color, #ffffff)',
  boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
  cursor: 'pointer',
  transition: 'all 0.18s ease',
  outline: 'none',
  boxSizing: 'border-box',
  selectors: {
    '&:hover': {
      borderColor: '#cbd5e1',
      boxShadow: '0 4px 14px rgba(0, 0, 0, 0.08)',
      transform: 'translateY(-1px)',
    },
    '&:active': {
      transform: 'translateY(0)',
      boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
    },
    '&:disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
      transform: 'none',
    },
  },
});

export const googleAuthLeft = style({
  display: 'flex',
  alignItems: 'center',
  gap: '12px',
});

export const googleAuthText = style({
  fontSize: '15px',
  fontWeight: 600,
  color: 'var(--affine-text-primary-color, #1f2937)',
});

export const googleAuthArrow = style({
  display: 'flex',
  alignItems: 'center',
  color: 'var(--affine-text-secondary-color, #6b7280)',
});

export const bulletList = style({
  display: 'flex',
  flexDirection: 'column',
  gap: '10px',
  margin: '0 0 24px 0',
  padding: 0,
  listStyle: 'none',
});

export const bulletItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '14px',
  color: 'var(--affine-text-secondary-color, #6b7280)',
  lineHeight: '1.4',
});

export const bulletDot = style({
  width: '4px',
  height: '4px',
  borderRadius: '50%',
  backgroundColor: '#9ca3af',
  flexShrink: 0,
});

export const termsNotice = style({
  fontSize: '12px',
  color: 'var(--affine-text-secondary-color, #6b7280)',
  lineHeight: '1.5',
  margin: '0 0 16px 0',
});

export const termsLink = style({
  color: 'inherit',
  textDecoration: 'underline',
  cursor: 'pointer',
});

export const localWorkspaceLink = style({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
  fontSize: '13px',
  fontWeight: 500,
  color: '#2563eb',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '6px 0',
  marginTop: '4px',
  selectors: {
    '&:hover': {
      textDecoration: 'underline',
    },
  },
});
