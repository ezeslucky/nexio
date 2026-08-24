import { EmbedLoomBlockSchema } from '@canvas/nexio-model';
import { BlockHtmlAdapterExtension } from '@canvas/nexio-shared/adapters';

import { createEmbedBlockHtmlAdapterMatcher } from '../../common/adapters/html.js';

export const embedLoomBlockHtmlAdapterMatcher =
  createEmbedBlockHtmlAdapterMatcher(EmbedLoomBlockSchema.model.flavour);

export const EmbedLoomBlockHtmlAdapterExtension = BlockHtmlAdapterExtension(
  embedLoomBlockHtmlAdapterMatcher
);
