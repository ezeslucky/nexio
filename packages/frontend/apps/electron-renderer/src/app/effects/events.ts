import { DesktopApiService } from '@nexio/core/modules/desktop-api';
import { WorkspaceDialogService } from '@nexio/core/modules/dialogs';
import type { SettingTab } from '@nexio/core/modules/dialogs/constant';
import { DocsService } from '@nexio/core/modules/doc';
import { JournalService } from '@nexio/core/modules/journal';
import { LifecycleService } from '@nexio/core/modules/lifecycle';
import { WorkbenchService } from '@nexio/core/modules/workbench';
import { apis, events } from '@nexio/electron-api';
import type { FrameworkProvider } from '@toeverything/infra';

import { setupRecordingEvents } from './recording';
import { getCurrentWorkspace } from './utils';

export function setupEvents(frameworkProvider: FrameworkProvider) {
  // setup application lifecycle events, and emit application start event
  window.addEventListener('focus', () => {
    frameworkProvider.get(LifecycleService).applicationFocus();
  });
  frameworkProvider.get(LifecycleService).applicationStart();
  window.addEventListener('unload', () => {
    frameworkProvider
      .get(DesktopApiService)
      .api.handler.ui.pingAppLayoutReady(false)
      .catch(console.error);
  });

  events?.applicationMenu.openInSettingModal(({ activeTab, scrollAnchor }) => {
    using currentWorkspace = getCurrentWorkspace(frameworkProvider);
    if (!currentWorkspace) {
      return;
    }
    const { workspace } = currentWorkspace;
    const workspaceDialogService = workspace.scope.get(WorkspaceDialogService);
    // close all other dialogs first
    workspaceDialogService.closeAll();
    workspaceDialogService.open('setting', {
      activeTab: activeTab as unknown as SettingTab,
      scrollAnchor,
    });
  });

  events?.applicationMenu.onNewPageAction(type => {
    apis?.ui
      .isActiveTab()
      .then(isActive => {
        if (!isActive) {
          return;
        }
        using currentWorkspace = getCurrentWorkspace(frameworkProvider);
        if (!currentWorkspace) {
          return;
        }
        const { workspace } = currentWorkspace;
        const docsService = workspace.scope.get(DocsService);

        const page = docsService.createDoc({ primaryMode: type });
        workspace.scope.get(WorkbenchService).workbench.openDoc(page.id);
      })
      .catch(err => {
        console.error(err);
      });
  });

  events?.applicationMenu.onOpenJournal(() => {
    using currentWorkspace = getCurrentWorkspace(frameworkProvider);
    if (!currentWorkspace) {
      return;
    }
    const { workspace, dispose } = currentWorkspace;

    const workbench = workspace.scope.get(WorkbenchService).workbench;
    const journalService = workspace.scope.get(JournalService);
    const docId = journalService.ensureJournalByDate(new Date()).id;
    workbench.openDoc(docId);

    dispose();
  });

  setupRecordingEvents(frameworkProvider);
}
