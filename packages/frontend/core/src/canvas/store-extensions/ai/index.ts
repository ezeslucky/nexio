import { AIChatBlockSchemaExtension } from '@nexio/core/canvas/ai/blocks';
import { TranscriptionBlockSchemaExtension } from '@nexio/core/canvas/ai/blocks/transcription-block/model';
import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@canvas/nexio/ext-loader';

export class AIStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-store-extensions';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(AIChatBlockSchemaExtension);
    context.register(TranscriptionBlockSchemaExtension);
  }
}
