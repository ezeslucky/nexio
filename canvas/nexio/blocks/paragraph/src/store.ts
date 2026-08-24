import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { ParagraphBlockSchemaExtension } from '@canvas/nexio-model';

import { ParagraphBlockAdapterExtensions } from './adapters/extension';

export class ParagraphStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-paragraph-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(ParagraphBlockSchemaExtension);
    context.register(ParagraphBlockAdapterExtensions);
  }
}
