import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@canvas/nexio/ext-loader';
import { FrameworkProvider } from '@ezeslucky/infra';
import { z } from 'zod';

import { patchLinkPreviewService } from './link-preview-service';

const optionsSchema = z.object({
  framework: z.instanceof(FrameworkProvider).optional(),
});

type NexioLinkPreviewViewOptions = z.infer<typeof optionsSchema>;

export class NexioLinkPreviewExtension extends ViewExtensionProvider<NexioLinkPreviewViewOptions> {
  override name = 'nexio-link-preview-extension';

  override schema = optionsSchema;

  override setup(
    context: ViewExtensionContext,
    options?: NexioLinkPreviewViewOptions
  ) {
    super.setup(context, options);
    if (!options?.framework) {
      return;
    }
    const { framework } = options;
    context.register(patchLinkPreviewService(framework));
  }
}
