import { createIdentifier } from '@canvas/global/di';
import type { ExtensionType } from '@canvas/store';

import type { PeekViewService } from './type.js';

export const PeekViewProvider = createIdentifier<PeekViewService>(
  'NexioPeekViewProvider'
);

export function PeekViewExtension(service: PeekViewService): ExtensionType {
  return {
    setup: di => {
      di.override(PeekViewProvider, () => service);
    },
  };
}
