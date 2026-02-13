/* CSS variables. You need to handle all places where `CSS variables` are marked. */

import { LINE_COLORS } from '@blocksuite/nexio-model';
import {
  type NexioCssVariables,
  type NexioTheme,
  cssVar,
} from '@toeverything/theme';
export { cssVar } from '@toeverything/theme';
import { type NexioThemeKeyV2, cssVarV2 } from '@toeverything/theme/v2';
import { unsafeCSS } from 'lit';
export { cssVarV2 } from '@toeverything/theme/v2';
export const ColorVariables = [
  '--nexio-brand-color',
  '--nexio-primary-color',
  '--nexio-secondary-color',
  '--nexio-tertiary-color',
  '--nexio-hover-color',
  '--nexio-icon-color',
  '--nexio-icon-secondary',
  '--nexio-border-color',
  '--nexio-divider-color',
  '--nexio-placeholder-color',
  '--nexio-quote-color',
  '--nexio-link-color',
  '--nexio-edgeless-grid-color',
  '--nexio-success-color',
  '--nexio-warning-color',
  '--nexio-error-color',
  '--nexio-processing-color',
  '--nexio-text-emphasis-color',
  '--nexio-text-primary-color',
  '--nexio-text-secondary-color',
  '--nexio-text-disable-color',
  '--nexio-black-10',
  '--nexio-black-30',
  '--nexio-black-50',
  '--nexio-black-60',
  '--nexio-black-80',
  '--nexio-black-90',
  '--nexio-black',
  '--nexio-white-10',
  '--nexio-white-30',
  '--nexio-white-50',
  '--nexio-white-60',
  '--nexio-white-80',
  '--nexio-white-90',
  '--nexio-white',
  '--nexio-background-code-block',
  '--nexio-background-tertiary-color',
  '--nexio-background-processing-color',
  '--nexio-background-error-color',
  '--nexio-background-warning-color',
  '--nexio-background-success-color',
  '--nexio-background-primary-color',
  '--nexio-background-secondary-color',
  '--nexio-background-modal-color',
  '--nexio-background-overlay-panel-color',
  '--nexio-tag-blue',
  '--nexio-tag-green',
  '--nexio-tag-teal',
  '--nexio-tag-white',
  '--nexio-tag-purple',
  '--nexio-tag-red',
  '--nexio-tag-pink',
  '--nexio-tag-yellow',
  '--nexio-tag-orange',
  '--nexio-tag-gray',
  ...LINE_COLORS,
  '--nexio-tooltip',
  '--nexio-blue',
];

export const SizeVariables = [
  '--nexio-font-h-1',
  '--nexio-font-h-2',
  '--nexio-font-h-3',
  '--nexio-font-h-4',
  '--nexio-font-h-5',
  '--nexio-font-h-6',
  '--nexio-font-base',
  '--nexio-font-sm',
  '--nexio-font-xs',
  '--nexio-line-height',
  '--nexio-z-index-modal',
  '--nexio-z-index-popover',
];

export const FontFamilyVariables = [
  '--nexio-font-family',
  '--nexio-font-number-family',
  '--nexio-font-code-family',
];

export const StyleVariables = [
  '--nexio-editor-width',

  '--nexio-theme-mode',
  '--nexio-editor-mode',
  /* --nexio-palette-transparent: special values added for the sake of logical consistency. */
  '--nexio-palette-transparent',

  '--nexio-popover-shadow',
  '--nexio-menu-shadow',
  '--nexio-float-button-shadow',
  '--nexio-shadow-1',
  '--nexio-shadow-2',
  '--nexio-shadow-3',

  '--nexio-paragraph-space',
  '--nexio-popover-radius',
  '--nexio-scale',
  ...SizeVariables,
  ...ColorVariables,
  ...FontFamilyVariables,
] as const;

type VariablesType = typeof StyleVariables;
export type CssVariableName = Extract<
  VariablesType[keyof VariablesType],
  string
>;

export type CssVariablesMap = Record<CssVariableName, string>;

export const unsafeCSSVar = (
  key: keyof NexioCssVariables | keyof NexioTheme,
  fallback?: string
) => unsafeCSS(cssVar(key, fallback));

export const unsafeCSSVarV2 = (key: NexioThemeKeyV2, fallback?: string) =>
  unsafeCSS(cssVarV2(key, fallback));
