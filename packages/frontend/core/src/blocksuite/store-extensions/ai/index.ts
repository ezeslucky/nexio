import { AIChatBlockSchemaExtension } from '@nexio/core/blocksuite/ai/blocks';
import { TranscriptionBlockSchemaExtension } from '@nexio/core/blocksuite/ai/blocks/transcription-block/model';
import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/nexio/ext-loader';

export class AIStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-store-extensions';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(AIChatBlockSchemaExtension);
    context.register(TranscriptionBlockSchemaExtension);
  }
}
