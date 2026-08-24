import { EmbedYoutubeBlockSchema } from '@canvas/nexio-model';
import { SlashMenuConfigExtension } from '@canvas/nexio-widget-slash-menu';
import { BlockViewExtension, FlavourExtension } from '@canvas/std';
import type { ExtensionType } from '@canvas/store';
import { literal } from 'lit/static-html.js';

import { createBuiltinToolbarConfigExtension } from '../configs/toolbar';
import { embedYoutubeSlashMenuConfig } from './configs/slash-menu';
import { EmbedYoutubeBlockInteraction } from './embed-edgeless-youtube-block';
import { EmbedYoutubeBlockComponent } from './embed-youtube-block';
import {
  EmbedYoutubeBlockOptionConfig,
  EmbedYoutubeBlockService,
} from './embed-youtube-service';

const flavour = EmbedYoutubeBlockSchema.model.flavour;

export const EmbedYoutubeViewExtensions: ExtensionType[] = [
  FlavourExtension(flavour),
  EmbedYoutubeBlockService,
  BlockViewExtension(flavour, model => {
    return model.parent?.flavour === 'nexio:surface'
      ? literal`nexio-embed-edgeless-youtube-block`
      : literal`nexio-embed-youtube-block`;
  }),
  EmbedYoutubeBlockOptionConfig,
  createBuiltinToolbarConfigExtension(flavour, EmbedYoutubeBlockComponent),
  SlashMenuConfigExtension('nexio:embed-youtube', embedYoutubeSlashMenuConfig),
  EmbedYoutubeBlockInteraction,
].flat();
