import type { useI18n } from '@nexio/i18n';
import { track } from '@nexio/track';
import { SidebarIcon } from '@blocksuite/icons/rc';

import type { AppSidebarService } from '../modules/app-sidebar';
import { registerNexioCommand } from './registry';

export function registerNexioLayoutCommands({
  t,
  appSidebarService,
}: {
  t: ReturnType<typeof useI18n>;
  appSidebarService: AppSidebarService;
}) {
  const unsubs: Array<() => void> = [];
  unsubs.push(
    registerNexioCommand({
      id: 'nexio:toggle-left-sidebar',
      category: 'nexio:layout',
      icon: <SidebarIcon />,
      label: () =>
        appSidebarService.sidebar.open$.value
          ? t['com.nexio.cmdk.nexio.left-sidebar.collapse']()
          : t['com.nexio.cmdk.nexio.left-sidebar.expand'](),

      keyBinding: {
        binding: '$mod+/',
      },
      run() {
        track.$.navigationPanel.$.toggle({
          type: appSidebarService.sidebar.open$.value ? 'collapse' : 'expand',
        });
        appSidebarService.sidebar.toggleSidebar();
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
