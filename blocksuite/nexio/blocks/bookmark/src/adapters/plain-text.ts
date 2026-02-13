import { createEmbedBlockPlainTextAdapterMatcher } from '@blocksuite/nexio-block-embed';
import { BookmarkBlockSchema } from '@blocksuite/nexio-model';
import { BlockPlainTextAdapterExtension } from '@blocksuite/nexio-shared/adapters';

export const bookmarkBlockPlainTextAdapterMatcher =
  createEmbedBlockPlainTextAdapterMatcher(BookmarkBlockSchema.model.flavour);

export const BookmarkBlockPlainTextAdapterExtension =
  BlockPlainTextAdapterExtension(bookmarkBlockPlainTextAdapterMatcher);
