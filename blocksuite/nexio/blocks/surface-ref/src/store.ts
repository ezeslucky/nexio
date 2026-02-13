import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/nexio-ext-loader';
import { SurfaceRefBlockSchemaExtension } from '@blocksuite/nexio-model';

export class SurfaceRefStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-surface-ref-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(SurfaceRefBlockSchemaExtension);
  }
}
