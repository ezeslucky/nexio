import {
  type NexioCssVariables,
  combinedDarkCssVariables,
  combinedLightCssVariables,
} from '@ezeslucky/theme';
import { unsafeCSS } from 'lit';

const toolbarColorKeys: Array<keyof NexioCssVariables> = [
  '--nexio-background-overlay-panel-color',
  '--nexio-v2-layer-background-overlayPanel' as never,
  '--nexio-v2-layer-insideBorder-blackBorder' as never,
  '--nexio-v2-icon-primary' as never,
  '--nexio-background-error-color',
  '--nexio-background-primary-color',
  '--nexio-background-tertiary-color',
  '--nexio-icon-color',
  '--nexio-icon-secondary',
  '--nexio-border-color',
  '--nexio-divider-color',
  '--nexio-text-primary-color',
  '--nexio-hover-color',
  '--nexio-hover-color-filled',
];

export const lightToolbarStyles = (selector: string) => `
  ${selector}[data-app-theme='light'] {
    ${toolbarColorKeys
      .map(key => `${key}: ${unsafeCSS(combinedLightCssVariables[key])};`)
      .join('\n')}
  }
`;

export const darkToolbarStyles = (selector: string) => `
  ${selector}[data-app-theme='dark'] {
    ${toolbarColorKeys
      .map(key => `${key}: ${unsafeCSS(combinedDarkCssVariables[key])};`)
      .join('\n')}
  }
`;
