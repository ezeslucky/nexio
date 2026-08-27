import type { useI18n } from '@nexio/i18n';
import { track } from '@nexio/track';
import { ContactWithUsIcon, NewIcon } from '@blocksuite/icons/rc';

import type { WorkspaceDialogService } from '../modules/dialogs';
import type { UrlService } from '../modules/url';
import { registerNexioCommand } from './registry';

export function registerNexioHelpCommands({
  t,
  urlService,
  workspaceDialogService,
}: {
  t: ReturnType<typeof useI18n>;
  urlService: UrlService;
  workspaceDialogService: WorkspaceDialogService;
}) {
  const unsubs: Array<() => void> = [];
  unsubs.push(
    registerNexioCommand({
      id: 'nexio:help-whats-new',
      category: 'nexio:help',
      icon: <NewIcon />,
      label: t['com.nexio.cmdk.nexio.whats-new'](),
      run() {
        track.$.cmdk.help.openChangelog();
        urlService.openPopupWindow(BUILD_CONFIG.changelogUrl);
      },
    })
  );
  unsubs.push(
    registerNexioCommand({
      id: 'nexio:help-contact-us',
      category: 'nexio:help',
      icon: <ContactWithUsIcon />,
      label: t['com.nexio.cmdk.nexio.contact-us'](),
      run() {
        track.$.cmdk.help.contactUs();
        workspaceDialogService.open('setting', {
          activeTab: 'about',
        });
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
