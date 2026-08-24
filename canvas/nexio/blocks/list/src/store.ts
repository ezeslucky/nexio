import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { ListBlockSchemaExtension } from '@canvas/nexio-model';

import { ListBlockAdapterExtensions } from './adapters/extension';

export class ListStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-list-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(ListBlockSchemaExtension);
    context.register(ListBlockAdapterExtensions);
  }
}
