import { AIChatBlockSchema } from '@nexio/core/blocksuite/ai/blocks/ai-chat-block/model';
import { TranscriptionBlockSchema } from '@nexio/core/blocksuite/ai/blocks/transcription-block/model';
import { NexioSchemas } from '@canvas/nexio/schemas';
import { Schema } from '@canvas/nexio/store';

let _schema: Schema | null = null;
export function getNEXIOWorkspaceSchema() {
  if (!_schema) {
    _schema = new Schema();

    _schema.register([
      ...NexioSchemas,
      AIChatBlockSchema,
      TranscriptionBlockSchema,
    ]);
  }

  return _schema;
}
