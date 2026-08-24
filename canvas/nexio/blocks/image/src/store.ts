import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { ImageBlockSchemaExtension } from '@canvas/nexio-model';
import { ImageSelectionExtension } from '@canvas/nexio-shared/selection';

import { ImageBlockAdapterExtensions } from './adapters/extension';

export class ImageStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-image-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register([ImageBlockSchemaExtension, ImageSelectionExtension]);
    context.register(ImageBlockAdapterExtensions);
  }
}
