import type { ParagraphBlockModel } from '@canvas/nexio-model';
import { ConfigExtensionFactory } from '@canvas/std';

export interface ParagraphBlockConfig {
  getPlaceholder: (model: ParagraphBlockModel) => string;
}

export const ParagraphBlockConfigExtension =
  ConfigExtensionFactory<ParagraphBlockConfig>('nexio:paragraph');
