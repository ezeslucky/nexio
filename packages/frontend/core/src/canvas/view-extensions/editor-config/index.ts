import { getEditorConfigExtension } from '@nexio/core/canvas/view-extensions/editor-config/get-config';
import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@canvas/nexio/ext-loader';
import { FrameworkProvider } from '@ezeslucky/infra';
import { z } from 'zod';

const optionsSchema = z.object({
  framework: z.instanceof(FrameworkProvider).optional(),
});

type NexioEditorConfigViewOptions = z.infer<typeof optionsSchema>;

export class NexioEditorConfigViewExtension extends ViewExtensionProvider<NexioEditorConfigViewOptions> {
  override name = 'nexio-view-editor-config';

  override schema = optionsSchema;

  override setup(
    context: ViewExtensionContext,
    options?: NexioEditorConfigViewOptions
  ) {
    super.setup(context, options);
    const framework = options?.framework;
    if (!framework) {
      return;
    }

    if (context.scope === 'edgeless' || context.scope === 'page') {
      context.register(getEditorConfigExtension(framework));
    }
  }
}
