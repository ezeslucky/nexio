import { createEmbedBlockPlainTextAdapterMatcher } from '@canvas/nexio-block-embed';
import { BookmarkBlockSchema } from '@canvas/nexio-model';
import { BlockPlainTextAdapterExtension } from '@canvas/nexio-shared/adapters';

export const bookmarkBlockPlainTextAdapterMatcher =
  createEmbedBlockPlainTextAdapterMatcher(BookmarkBlockSchema.model.flavour);

export const BookmarkBlockPlainTextAdapterExtension =
  BlockPlainTextAdapterExtension(bookmarkBlockPlainTextAdapterMatcher);
