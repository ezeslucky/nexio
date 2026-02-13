import { BlockViewExtension } from '@blocksuite/nexio/std';
import type { ExtensionType } from '@blocksuite/nexio/store';
import { literal } from 'lit/static-html.js';

export const AIChatBlockSpec: ExtensionType[] = [
  BlockViewExtension('nexio:embed-ai-chat', model => {
    const parent = model.store.getParent(model.id);

    if (parent?.flavour === 'nexio:surface') {
      return literal`nexio-edgeless-ai-chat`;
    }

    return literal`nexio-ai-chat`;
  }),
];
