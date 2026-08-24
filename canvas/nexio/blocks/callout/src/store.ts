import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { CalloutBlockSchemaExtension } from '@canvas/nexio-model';

import { CalloutBlockMarkdownAdapterExtension } from './adapters/markdown';

export class CalloutStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-callout-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(CalloutBlockSchemaExtension);
    context.register(CalloutBlockMarkdownAdapterExtension);
  }
}
