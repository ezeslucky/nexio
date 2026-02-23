import { Service } from '@ezeslucky/infra';

import { SystemFontFamily } from '../entities/system-font-family';

export class SystemFontFamilyService extends Service {
  public readonly systemFontFamily =
    this.framework.createEntity(SystemFontFamily);
}
