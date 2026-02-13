import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/nexio-ext-loader';
import { DividerBlockSchemaExtension } from '@blocksuite/nexio-model';

import { DividerBlockAdapterExtensions } from './adapters/extension';

export class DividerStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-divider-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(DividerBlockSchemaExtension);
    context.register(DividerBlockAdapterExtensions);
  }
}
