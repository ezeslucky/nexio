import {
  EmbedSyncedDocBlockSchema,
  type EmbedSyncedDocModel,
} from '@canvas/nexio-model';
import { type BlockStdScope, ConfigExtensionFactory } from '@canvas/std';
import type { TemplateResult } from 'lit';

export type EmbedSyncedDocConfig = {
  edgelessHeader: (context: {
    model: EmbedSyncedDocModel;
    std: BlockStdScope;
  }) => TemplateResult;
};

export const EmbedSyncedDocConfigExtension =
  ConfigExtensionFactory<EmbedSyncedDocConfig>(
    EmbedSyncedDocBlockSchema.model.flavour
  );
