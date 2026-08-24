import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { BookmarkBlockSchemaExtension } from '@canvas/nexio-model';

import { BookmarkBlockAdapterExtensions } from './adapters/extension';

export class BookmarkStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-bookmark-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(BookmarkBlockSchemaExtension);
    context.register(BookmarkBlockAdapterExtensions);
  }
}
