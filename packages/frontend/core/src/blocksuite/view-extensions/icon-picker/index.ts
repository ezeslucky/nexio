import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/nexio/ext-loader';
import { FrameworkProvider } from '@toeverything/infra';
import { z } from 'zod';

import { patchIconPickerService } from './icon-picker-service';

const optionsSchema = z.object({
  framework: z.instanceof(FrameworkProvider).optional(),
});

type NexioIconPickerViewOptions = z.infer<typeof optionsSchema>;

export class NexioIconPickerExtension extends ViewExtensionProvider<NexioIconPickerViewOptions> {
  override name = 'nexio-icon-picker-extension';

  override schema = optionsSchema;

  override setup(
    context: ViewExtensionContext,
    options?: NexioIconPickerViewOptions
  ) {
    super.setup(context, options);
    if (!options?.framework) {
      return;
    }
    const { framework } = options;
    context.register(patchIconPickerService(framework));
  }
}
