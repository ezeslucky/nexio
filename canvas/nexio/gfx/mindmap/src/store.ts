import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@canvas/nexio-ext-loader';

import {
  mindmapToMarkdownAdapterMatcher,
  mindmapToPlainTextAdapterMatcher,
} from './adapter';

export class MindmapStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-mindmap-gfx';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(mindmapToPlainTextAdapterMatcher);
    context.register(mindmapToMarkdownAdapterMatcher);
  }
}
