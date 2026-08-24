import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { RootBlockSchemaExtension } from '@canvas/nexio-model';

import { RootBlockAdapterExtensions } from './adapters/extension';

export class RootStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-root-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(RootBlockSchemaExtension);
    context.register(RootBlockAdapterExtensions);
  }
}
