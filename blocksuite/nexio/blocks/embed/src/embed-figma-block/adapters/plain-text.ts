import { EmbedFigmaBlockSchema } from '@blocksuite/nexio-model';
import { BlockPlainTextAdapterExtension } from '@blocksuite/nexio-shared/adapters';

import { createEmbedBlockPlainTextAdapterMatcher } from '../../common/adapters/plain-text.js';

export const embedFigmaBlockPlainTextAdapterMatcher =
  createEmbedBlockPlainTextAdapterMatcher(EmbedFigmaBlockSchema.model.flavour);

export const EmbedFigmaBlockPlainTextAdapterExtension =
  BlockPlainTextAdapterExtension(embedFigmaBlockPlainTextAdapterMatcher);
