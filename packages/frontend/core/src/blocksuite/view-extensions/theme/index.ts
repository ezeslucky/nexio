import { getPreviewThemeExtension } from '@nexio/core/blocksuite/view-extensions/theme/preview-theme';
import { getThemeExtension } from '@nexio/core/blocksuite/view-extensions/theme/theme';
import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/nexio/ext-loader';
import { FrameworkProvider } from '@ezeslucky/infra';
import { z } from 'zod';

const optionsSchema = z.object({
  framework: z.instanceof(FrameworkProvider).optional(),
});

type NexioThemeViewOptions = z.infer<typeof optionsSchema>;

export class NexioThemeViewExtension extends ViewExtensionProvider<NexioThemeViewOptions> {
  override name = 'nexio-view-theme';

  override schema = optionsSchema;

  override setup(
    context: ViewExtensionContext,
    options?: NexioThemeViewOptions
  ) {
    super.setup(context, options);
    const framework = options?.framework;
    if (!framework) {
      return;
    }

    if (this.isPreview(context.scope)) {
      context.register(getPreviewThemeExtension(framework));
    } else {
      context.register(getThemeExtension(framework));
    }
  }
}
