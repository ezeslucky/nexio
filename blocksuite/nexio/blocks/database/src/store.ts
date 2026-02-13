import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/nexio-ext-loader';
import { DatabaseBlockSchemaExtension } from '@blocksuite/nexio-model';

import { DatabaseBlockAdapterExtensions } from './adapters/extension';
import { DatabaseSelectionExtension } from './selection';

export class DatabaseStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-database-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(DatabaseBlockSchemaExtension);
    context.register(DatabaseSelectionExtension);
    context.register(DatabaseBlockAdapterExtensions);
  }
}
