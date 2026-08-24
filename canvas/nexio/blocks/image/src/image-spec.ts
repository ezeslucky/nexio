import { ImageBlockSchema } from '@canvas/nexio-model';
import { SlashMenuConfigExtension } from '@canvas/nexio-widget-slash-menu';
import { BlockViewExtension, FlavourExtension } from '@canvas/std';
import type { ExtensionType } from '@canvas/store';
import { literal } from 'lit/static-html.js';

import { imageSlashMenuConfig } from './configs/slash-menu';
import { createBuiltinToolbarConfigExtension } from './configs/toolbar';
import { ImageEdgelessBlockInteraction } from './image-edgeless-block';
import { ImageDropOption } from './image-service';

const flavour = ImageBlockSchema.model.flavour;

export const ImageBlockSpec: ExtensionType[] = [
  FlavourExtension(flavour),
  BlockViewExtension(flavour, model => {
    const parent = model.store.getParent(model.id);

    if (parent?.flavour === 'nexio:surface') {
      return literal`nexio-edgeless-image`;
    }

    return literal`nexio-image`;
  }),
  ImageDropOption,
  ImageEdgelessBlockInteraction,
  createBuiltinToolbarConfigExtension(flavour),
  SlashMenuConfigExtension(flavour, imageSlashMenuConfig),
].flat();
