import { FeatureFlagService } from '@canvas/nexio/shared/services';
import { type BlockStdScope, LifeCycleWatcher } from '@canvas/nexio/std';

export class MobileFeatureFlagControl extends LifeCycleWatcher {
  static override key = 'mobile-patches';

  constructor(std: BlockStdScope) {
    super(std);
    const featureFlagService = std.get(FeatureFlagService);

    featureFlagService.setFlag('enable_mobile_keyboard_toolbar', true);
    featureFlagService.setFlag('enable_mobile_linked_doc_menu', true);
  }
}
