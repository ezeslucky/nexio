import {
  NEXIO_FLAGS,
  type FeatureFlagService,
} from '@nexio/core/modules/feature-flag';
import { FeatureFlagService as BSFeatureFlagService } from '@canvas/nexio/shared/services';
import { type ExtensionType, StoreExtension } from '@canvas/nexio/store';

export function getFeatureFlagSyncer(
  featureFlagService: FeatureFlagService
): ExtensionType {
  class FeatureFlagSyncer extends StoreExtension {
    static override key = 'feature-flag-syncer';

    override loaded() {
      const bsFeatureFlagService = this.store.get(BSFeatureFlagService);
      Object.entries(NEXIO_FLAGS).forEach(([key, flag]) => {
        if (flag.category === 'canvas') {
          const value =
            featureFlagService.flags[key as keyof NEXIO_FLAGS].value;
          if (value !== undefined) {
            bsFeatureFlagService.setFlag(flag.bsFlag, value);
          }
        }
      });
    }
  }

  return FeatureFlagSyncer;
}
