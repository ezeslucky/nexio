import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { AttachmentBlockSchemaExtension } from '@canvas/nexio-model';

import { AttachmentBlockAdapterExtensions } from './adapters/extension';

export class AttachmentStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-attachment-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(AttachmentBlockSchemaExtension);
    context.register(AttachmentBlockAdapterExtensions);
  }
}
