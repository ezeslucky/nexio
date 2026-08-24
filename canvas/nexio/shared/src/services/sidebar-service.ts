import { createIdentifier } from '@canvas/global/di';
import type { ExtensionType } from '@canvas/store';

export interface SidebarService {
  open: (tabId?: string) => void;
  close: () => void;
  getTabIds: () => string[];
}

export const SidebarExtensionIdentifier = createIdentifier<SidebarService>(
  'NexioSidebarExtension'
);

export const SidebarExtension = (service: SidebarService): ExtensionType => ({
  setup: di => {
    di.addImpl(SidebarExtensionIdentifier, () => service);
  },
});
