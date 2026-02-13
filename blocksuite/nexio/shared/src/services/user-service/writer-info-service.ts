import { createIdentifier } from '@blocksuite/global/di';
import type { ExtensionType } from '@blocksuite/store';

import type { NexioUserInfo } from './types';

export interface WriterInfoService {
  getWriterInfo(): NexioUserInfo | null;
}

export const WriterInfoProvider = createIdentifier<WriterInfoService>(
  'nexio-writer-info-service'
);

export function WriterInfoServiceExtension(
  service: WriterInfoService
): ExtensionType {
  return {
    setup(di) {
      di.addImpl(WriterInfoProvider, () => service);
    },
  };
}
