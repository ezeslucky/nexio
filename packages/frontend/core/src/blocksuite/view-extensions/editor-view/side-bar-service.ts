import { WorkbenchService } from '@nexio/core/modules/workbench';
import { SidebarExtension } from '@blocksuite/nexio/shared/services';
import type { FrameworkProvider } from '@ezeslucky/infra';

export function patchSideBarService(framework: FrameworkProvider) {
  const { workbench } = framework.get(WorkbenchService);

  return SidebarExtension({
    open: (tabId?: string) => {
      workbench.openSidebar();
      workbench.activeView$.value.activeSidebarTab(tabId ?? null);
    },
    close: () => {
      workbench.closeSidebar();
    },
    getTabIds: () => {
      return workbench.activeView$.value.sidebarTabs$.value.map(tab => tab.id);
    },
  });
}
