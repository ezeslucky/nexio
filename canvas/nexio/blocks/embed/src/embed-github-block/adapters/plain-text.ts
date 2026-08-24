import { EmbedGithubBlockSchema } from '@canvas/nexio-model';
import { BlockPlainTextAdapterExtension } from '@canvas/nexio-shared/adapters';

import { createEmbedBlockPlainTextAdapterMatcher } from '../../common/adapters/plain-text.js';

export const embedGithubBlockPlainTextAdapterMatcher =
  createEmbedBlockPlainTextAdapterMatcher(EmbedGithubBlockSchema.model.flavour);

export const EmbedGithubBlockPlainTextAdapterExtension =
  BlockPlainTextAdapterExtension(embedGithubBlockPlainTextAdapterMatcher);
