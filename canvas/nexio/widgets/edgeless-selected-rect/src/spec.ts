import { WidgetViewExtension } from '@canvas/std';
import { literal, unsafeStatic } from 'lit/static-html.js';

import { EDGELESS_SELECTED_RECT_WIDGET } from './edgeless-selected-rect';

export const edgelessSelectedRectWidget = WidgetViewExtension(
  'nexio:page',
  EDGELESS_SELECTED_RECT_WIDGET,
  literal`${unsafeStatic(EDGELESS_SELECTED_RECT_WIDGET)}`
);
