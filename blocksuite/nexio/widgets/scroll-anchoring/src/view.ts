import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/nexio-ext-loader';

import { effects } from './effects';
import { scrollAnchoringWidget } from './index';

export class ScrollAnchoringViewExtension extends ViewExtensionProvider {
  override name = 'nexio-scroll-anchoring-widget';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    context.register(scrollAnchoringWidget);
  }
}
