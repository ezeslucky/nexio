import { createIdentifier } from '@canvas/global/di';
import type { ExtensionType } from '@canvas/store';
import { Subject } from 'rxjs';

import type { Viewport } from '../types';

export const PageViewportService = createIdentifier<Subject<Viewport>>(
  'PageViewportService'
);

export const PageViewportServiceExtension: ExtensionType = {
  setup: di => {
    di.addImpl(PageViewportService, () => new Subject<Viewport>());
  },
};
