import { EmbedLoomBlockSchema } from '@canvas/nexio-model';
import { BlockMarkdownAdapterExtension } from '@canvas/nexio-shared/adapters';

import { createEmbedBlockMarkdownAdapterMatcher } from '../../common/adapters/markdown.js';

export const embedLoomBlockMarkdownAdapterMatcher =
  createEmbedBlockMarkdownAdapterMatcher(EmbedLoomBlockSchema.model.flavour);

export const EmbedLoomMarkdownAdapterExtension = BlockMarkdownAdapterExtension(
  embedLoomBlockMarkdownAdapterMatcher
);
