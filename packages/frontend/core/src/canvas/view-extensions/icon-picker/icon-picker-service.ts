import { IconPickerServiceIdentifier } from '@canvas/nexio/shared/services';
import { type ExtensionType } from '@canvas/nexio/store';
import type { Container } from '@canvas/global/di';
import type { FrameworkProvider } from '@ezeslucky/infra';

import { IconPickerService } from '../../../modules/icon-picker/services/icon-picker';

/**
 * Patch the icon picker service to make it available in Canvas
 * @param framework
 * @returns
 */
export function patchIconPickerService(
  framework: FrameworkProvider
): ExtensionType {
  return {
    setup: (di: Container) => {
      di.override(IconPickerServiceIdentifier, () => {
        return framework.get(IconPickerService);
      });
    },
  };
}
