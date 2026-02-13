import { EmbedLoomBlockSchema } from '@blocksuite/nexio-model';
import { BlockPlainTextAdapterExtension } from '@blocksuite/nexio-shared/adapters';

import { createEmbedBlockPlainTextAdapterMatcher } from '../../common/adapters/plain-text.js';

export const embedLoomBlockPlainTextAdapterMatcher =
  createEmbedBlockPlainTextAdapterMatcher(EmbedLoomBlockSchema.model.flavour);

export const EmbedLoomBlockPlainTextAdapterExtension =
  BlockPlainTextAdapterExtension(embedLoomBlockPlainTextAdapterMatcher);
