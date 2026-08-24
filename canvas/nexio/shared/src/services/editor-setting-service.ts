import { createIdentifier } from '@canvas/global/di';
import type { DeepPartial } from '@canvas/global/utils';
import type { ExtensionType } from '@canvas/store';
import type { Signal } from '@preact/signals-core';
import { z } from 'zod';

import { NodePropsSchema } from '../utils/index.js';

export const GeneralSettingSchema = z
  .object({
    edgelessScrollZoom: z.boolean().default(false),
    edgelessDisableScheduleUpdate: z.boolean().default(false),
    docCanvasPreferView: z
      .enum(['nexio:embed-linked-doc', 'nexio:embed-synced-doc'])
      .default('nexio:embed-synced-doc'),
  })
  .merge(NodePropsSchema);

export type EditorSetting = z.infer<typeof GeneralSettingSchema>;

export interface EditorSettingService {
  setting$: Signal<DeepPartial<EditorSetting>>;
  set?: (
    key: keyof EditorSetting,
    value: EditorSetting[keyof EditorSetting]
  ) => void;
}

export const EditorSettingProvider = createIdentifier<EditorSettingService>(
  'NexioEditorSettingProvider'
);

export function EditorSettingExtension(
  service: EditorSettingService
): ExtensionType {
  return {
    setup: di => {
      di.override(EditorSettingProvider, () => service);
    },
  };
}
