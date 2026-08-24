import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { EdgelessTextBlockSchemaExtension } from '@canvas/nexio-model';

export class EdgelessTextStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-edgeless-text-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(EdgelessTextBlockSchemaExtension);
  }
}
