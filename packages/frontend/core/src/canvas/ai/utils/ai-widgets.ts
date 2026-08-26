import type { EditorHost } from '@canvas/nexio/std';

import {
  NEXIO_AI_PANEL_WIDGET,
  NexioAIPanelWidget,
} from '../widgets/ai-panel/ai-panel';

export const getAIPanelWidget = (host: EditorHost): NexioAIPanelWidget => {
  const rootBlockId = host.store.root?.id;
  if (!rootBlockId) {
    throw new Error('rootBlockId is not found');
  }
  const aiPanel = host.view.getWidget(NEXIO_AI_PANEL_WIDGET, rootBlockId);
  if (!(aiPanel instanceof NexioAIPanelWidget)) {
    throw new Error('AI panel not found');
  }
  return aiPanel;
};
