import { EmbedGithubBlockSchema } from '@canvas/nexio-model';
import { BlockHtmlAdapterExtension } from '@canvas/nexio-shared/adapters';

import { createEmbedBlockHtmlAdapterMatcher } from '../../common/adapters/html.js';

export const embedGithubBlockHtmlAdapterMatcher =
  createEmbedBlockHtmlAdapterMatcher(EmbedGithubBlockSchema.model.flavour);

export const EmbedGithubBlockHtmlAdapterExtension = BlockHtmlAdapterExtension(
  embedGithubBlockHtmlAdapterMatcher
);
