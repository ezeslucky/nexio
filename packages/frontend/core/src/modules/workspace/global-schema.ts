import { AIChatBlockSchema } from '@nexio/core/blocksuite/ai/blocks/ai-chat-block/model';
import { TranscriptionBlockSchema } from '@nexio/core/blocksuite/ai/blocks/transcription-block/model';
import { AffineSchemas } from '@blocksuite/affine/schemas';
import { Schema } from '@blocksuite/affine/store';

let _schema: Schema | null = null;
export function getNexioWorkspaceSchema() {
  if (!_schema) {
    _schema = new Schema();

    _schema.register([
      ...AffineSchemas,
      AIChatBlockSchema,
      TranscriptionBlockSchema,
    ]);
  }

  return _schema;
}

// Backwards compatibility alias
export const getAFFiNEWorkspaceSchema = getNexioWorkspaceSchema;
