import { EmbedFigmaBlockSchema } from '@canvas/nexio-model';
import { BlockHtmlAdapterExtension } from '@canvas/nexio-shared/adapters';

import { createEmbedBlockHtmlAdapterMatcher } from '../../common/adapters/html.js';

export const embedFigmaBlockHtmlAdapterMatcher =
  createEmbedBlockHtmlAdapterMatcher(EmbedFigmaBlockSchema.model.flavour);

export const EmbedFigmaBlockHtmlAdapterExtension = BlockHtmlAdapterExtension(
  embedFigmaBlockHtmlAdapterMatcher
);
