import { EmbedSyncedDocBlockSchema } from '@canvas/nexio-model';
import { BlockViewExtension, FlavourExtension } from '@canvas/std';
import type { ExtensionType } from '@canvas/store';
import { literal } from 'lit/static-html.js';

import { createBuiltinToolbarConfigExtension } from './configs/toolbar';
import { HeightInitializationExtension } from './init-height-extension';

const flavour = EmbedSyncedDocBlockSchema.model.flavour;

export const EmbedSyncedDocViewExtensions: ExtensionType[] = [
  FlavourExtension(flavour),
  BlockViewExtension(flavour, model => {
    return model.parent?.flavour === 'nexio:surface'
      ? literal`nexio-embed-edgeless-synced-doc-block`
      : literal`nexio-embed-synced-doc-block`;
  }),
  createBuiltinToolbarConfigExtension(flavour),
  HeightInitializationExtension,
].flat();
