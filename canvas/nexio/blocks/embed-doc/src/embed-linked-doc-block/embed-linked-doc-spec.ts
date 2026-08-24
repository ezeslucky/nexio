import { EmbedLinkedDocBlockSchema } from '@canvas/nexio-model';
import { BlockViewExtension } from '@canvas/std';
import type { ExtensionType } from '@canvas/store';
import { literal } from 'lit/static-html.js';

import { LinkedDocSlashMenuConfigExtension } from './configs/slash-menu';
import { createBuiltinToolbarConfigExtension } from './configs/toolbar';
import { EmbedLinkedDocInteraction } from './embed-edgeless-linked-doc-block';

const flavour = EmbedLinkedDocBlockSchema.model.flavour;

export const EmbedLinkedDocViewExtensions: ExtensionType[] = [
  BlockViewExtension(flavour, model => {
    return model.parent?.flavour === 'nexio:surface'
      ? literal`nexio-embed-edgeless-linked-doc-block`
      : literal`nexio-embed-linked-doc-block`;
  }),
  createBuiltinToolbarConfigExtension(flavour),
  EmbedLinkedDocInteraction,
  LinkedDocSlashMenuConfigExtension,
].flat();
