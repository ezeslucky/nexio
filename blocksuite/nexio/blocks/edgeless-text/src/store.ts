import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/nexio-ext-loader';
import { EdgelessTextBlockSchemaExtension } from '@blocksuite/nexio-model';

export class EdgelessTextStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-edgeless-text-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(EdgelessTextBlockSchemaExtension);
  }
}
