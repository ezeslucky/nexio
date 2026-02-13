import { WidgetViewExtension } from '@blocksuite/std';
import { literal, unsafeStatic } from 'lit/static-html.js';

import { NEXIO_DOC_REMOTE_SELECTION_WIDGET } from './doc';
import { NEXIO_EDGELESS_REMOTE_SELECTION_WIDGET } from './edgeless';

export * from './doc';
export * from './edgeless';

export const docRemoteSelectionWidget = WidgetViewExtension(
  'nexio:page',
  NEXIO_DOC_REMOTE_SELECTION_WIDGET,
  literal`${unsafeStatic(NEXIO_DOC_REMOTE_SELECTION_WIDGET)}`
);

export const edgelessRemoteSelectionWidget = WidgetViewExtension(
  'nexio:page',
  NEXIO_EDGELESS_REMOTE_SELECTION_WIDGET,
  literal`${unsafeStatic(NEXIO_EDGELESS_REMOTE_SELECTION_WIDGET)}`
);
