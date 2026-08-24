import { WidgetViewExtension } from '@canvas/std';
import { literal, unsafeStatic } from 'lit/static-html.js';

import { NEXIO_SCROLL_ANCHORING_WIDGET } from './scroll-anchoring.js';

export * from './scroll-anchoring.js';

export const scrollAnchoringWidget = WidgetViewExtension(
  'nexio:page',
  NEXIO_SCROLL_ANCHORING_WIDGET,
  literal`${unsafeStatic(NEXIO_SCROLL_ANCHORING_WIDGET)}`
);
