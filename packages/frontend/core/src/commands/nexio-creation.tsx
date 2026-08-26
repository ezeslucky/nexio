import type { useI18n } from '@nexio/i18n';
import { track } from '@nexio/track';
import type { DocMode } from '@canvas/nexio/model';
import { ImportIcon, PlusIcon } from '@canvas/icons/rc';

import type { usePageHelper } from '../canvas/block-suite-page-list/utils';
import type { GlobalDialogService } from '../modules/dialogs';
import { registerNexioCommand } from './registry';

export function registerNexioCreationCommands({
  pageHelper,
  t,
  globalDialogService,
}: {
  t: ReturnType<typeof useI18n>;
  pageHelper: ReturnType<typeof usePageHelper>;
  globalDialogService: GlobalDialogService;
}) {
  const unsubs: Array<() => void> = [];
  unsubs.push(
    registerNexioCommand({
      id: 'nexio:new-page',
      category: 'nexio:creation',
      label: t['com.nexio.cmdk.nexio.new-page'](),
      icon: <PlusIcon />,
      keyBinding: BUILD_CONFIG.isElectron
        ? {
            binding: '$mod+N',
            skipRegister: true,
          }
        : undefined,
      run() {
        track.$.cmdk.creation.createDoc({ mode: 'page' });

        pageHelper.createPage('page' as DocMode);
      },
    })
  );

  unsubs.push(
    registerNexioCommand({
      id: 'nexio:new-edgeless-page',
      category: 'nexio:creation',
      icon: <PlusIcon />,
      label: t['com.nexio.cmdk.nexio.new-edgeless-page'](),
      run() {
        track.$.cmdk.creation.createDoc({
          mode: 'edgeless',
        });

        pageHelper.createEdgeless();
      },
    })
  );

  unsubs.push(
    registerNexioCommand({
      id: 'nexio:new-workspace',
      category: 'nexio:creation',
      icon: <PlusIcon />,
      label: t['com.nexio.cmdk.nexio.new-workspace'](),
      run() {
        track.$.cmdk.workspace.createWorkspace();

        globalDialogService.open('create-workspace', {});
      },
    })
  );
  unsubs.push(
    registerNexioCommand({
      id: 'nexio:import-workspace',
      category: 'nexio:creation',
      icon: <ImportIcon />,
      label: t['com.nexio.cmdk.nexio.import-workspace'](),
      preconditionStrategy: () => {
        return BUILD_CONFIG.isElectron;
      },
      run() {
        track.$.cmdk.workspace.createWorkspace({
          control: 'import',
        });

        globalDialogService.open('import-workspace', undefined);
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
