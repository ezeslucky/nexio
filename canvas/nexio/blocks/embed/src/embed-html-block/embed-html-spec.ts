import { EmbedHtmlBlockSchema } from '@canvas/nexio-model';
import { BlockViewExtension } from '@canvas/std';
import type { ExtensionType } from '@canvas/store';
import { literal } from 'lit/static-html.js';

import { createBuiltinToolbarConfigExtension } from './configs/toolbar';
import { EmbedEdgelessHtmlBlockInteraction } from './embed-edgeless-html-block';

const flavour = EmbedHtmlBlockSchema.model.flavour;

export const EmbedHtmlViewExtensions: ExtensionType[] = [
  BlockViewExtension(flavour, model => {
    return model.parent?.flavour === 'nexio:surface'
      ? literal`nexio-embed-edgeless-html-block`
      : literal`nexio-embed-html-block`;
  }),
  createBuiltinToolbarConfigExtension(flavour),
  EmbedEdgelessHtmlBlockInteraction,
].flat();
