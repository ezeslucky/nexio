import { WidgetViewExtension } from '@blocksuite/std';
import { literal, unsafeStatic } from 'lit/static-html.js';

import { NEXIO_TOOLBAR_WIDGET } from './toolbar';

export * from './toolbar';

export const toolbarWidget = WidgetViewExtension(
  'nexio:page',
  NEXIO_TOOLBAR_WIDGET,
  literal`${unsafeStatic(NEXIO_TOOLBAR_WIDGET)}`
);
