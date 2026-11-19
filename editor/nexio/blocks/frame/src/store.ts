import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/nexio-ext-loader';
import { FrameBlockSchemaExtension } from '@blocksuite/nexio-model';

export class FrameStoreExtension extends StoreExtensionProvider {
  override name = 'affine-frame-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register([FrameBlockSchemaExtension]);
  }
}
