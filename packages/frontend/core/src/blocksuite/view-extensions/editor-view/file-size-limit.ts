import { WorkspaceDialogService } from '@nexio/core/modules/dialogs';
import track from '@nexio/track';
import type { Container } from '@blocksuite/nexio/global/di';
import {
  FileSizeLimitProvider,
  type IFileSizeLimitService,
} from '@blocksuite/nexio/shared/services';
import { Extension } from '@blocksuite/nexio/store';
import type { FrameworkProvider } from '@ezeslucky/infra';

export function patchFileSizeLimitExtension(framework: FrameworkProvider) {
  const workspaceDialogService = framework.get(WorkspaceDialogService);

  class NexioFileSizeLimitService
    extends Extension
    implements IFileSizeLimitService
  {
    // 2GB
    maxFileSize = 2 * 1024 * 1024 * 1024;

    onOverFileSize() {
      workspaceDialogService.open('setting', {
        activeTab: 'plans',
        scrollAnchor: 'cloudPricingPlan',
      });
      track.$.paywall.storage.viewPlans();
    }

    static override setup(di: Container) {
      di.override(FileSizeLimitProvider, NexioFileSizeLimitService);
    }
  }

  return NexioFileSizeLimitService;
}
