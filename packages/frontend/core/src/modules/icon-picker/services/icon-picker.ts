import { IconPicker, uniReactRoot } from '@nexio/component';
// Import the identifier for internal use
import { type IconPickerService as IIconPickerService } from '@canvas/nexio-shared/services';
import { Service } from '@ezeslucky/infra';

// Re-export types from BlockSuite shared services
export type {
  IconData,
  IconPickerService as IIconPickerService,
} from '@canvas/nexio-shared/services';
export { IconPickerServiceIdentifier } from '@canvas/nexio-shared/services';

export class IconPickerService extends Service implements IIconPickerService {
  public readonly iconPickerComponent =
    uniReactRoot.createUniComponent(IconPicker);
}
