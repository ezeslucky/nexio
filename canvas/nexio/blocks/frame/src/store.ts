import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { FrameBlockSchemaExtension } from '@canvas/nexio-model';

export class FrameStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-frame-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register([FrameBlockSchemaExtension]);
  }
}
