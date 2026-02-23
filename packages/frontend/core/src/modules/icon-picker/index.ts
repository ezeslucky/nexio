import { type Framework } from '@ezeslucky/infra';

import { IconPickerService } from './services/icon-picker';

export { IconPickerService } from './services/icon-picker';

export function configureIconPickerModule(framework: Framework) {
  framework.service(IconPickerService);
}
