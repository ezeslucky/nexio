import { EmbedFigmaBlockSchema } from '@blocksuite/nexio-model';
import { BlockHtmlAdapterExtension } from '@blocksuite/nexio-shared/adapters';

import { createEmbedBlockHtmlAdapterMatcher } from '../../common/adapters/html.js';

export const embedFigmaBlockHtmlAdapterMatcher =
  createEmbedBlockHtmlAdapterMatcher(EmbedFigmaBlockSchema.model.flavour);

export const EmbedFigmaBlockHtmlAdapterExtension = BlockHtmlAdapterExtension(
  embedFigmaBlockHtmlAdapterMatcher
);
