import { createEmbedBlockHtmlAdapterMatcher } from '@blocksuite/nexio-block-embed';
import { BookmarkBlockSchema } from '@blocksuite/nexio-model';
import { BlockHtmlAdapterExtension } from '@blocksuite/nexio-shared/adapters';

export const bookmarkBlockHtmlAdapterMatcher =
  createEmbedBlockHtmlAdapterMatcher(BookmarkBlockSchema.model.flavour);

export const BookmarkBlockHtmlAdapterExtension = BlockHtmlAdapterExtension(
  bookmarkBlockHtmlAdapterMatcher
);
