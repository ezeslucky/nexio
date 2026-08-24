import { createEmbedBlockHtmlAdapterMatcher } from '@canvas/nexio-block-embed';
import { BookmarkBlockSchema } from '@canvas/nexio-model';
import { BlockHtmlAdapterExtension } from '@canvas/nexio-shared/adapters';

export const bookmarkBlockHtmlAdapterMatcher =
  createEmbedBlockHtmlAdapterMatcher(BookmarkBlockSchema.model.flavour);

export const BookmarkBlockHtmlAdapterExtension = BlockHtmlAdapterExtension(
  bookmarkBlockHtmlAdapterMatcher
);
