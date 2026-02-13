import { notify } from '@nexio/component';
import { updateReadyAtom } from '@nexio/core/components/hooks/use-app-updater';
import type { useI18n } from '@nexio/i18n';
import { track } from '@nexio/track';
import { ResetIcon } from '@blocksuite/icons/rc';
import type { createStore } from 'jotai';

import { registerNexioCommand } from './registry';

export function registerNexioUpdatesCommands({
  t,
  store,
  quitAndInstall,
}: {
  t: ReturnType<typeof useI18n>;
  store: ReturnType<typeof createStore>;
  quitAndInstall: () => Promise<void>;
}) {
  const unsubs: Array<() => void> = [];

  unsubs.push(
    registerNexioCommand({
      id: 'nexio:restart-to-upgrade',
      category: 'nexio:updates',
      icon: <ResetIcon />,
      label: t['com.nexio.cmdk.nexio.restart-to-upgrade'](),
      preconditionStrategy: () => !!store.get(updateReadyAtom),
      run() {
        track.$.cmdk.updates.quitAndInstall();

        quitAndInstall().catch(err => {
          notify.error({
            title: 'Failed to restart to upgrade',
            message: 'Please restart the app manually to upgrade.',
          });
          console.error(err);
        });
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
