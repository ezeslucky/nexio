import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@canvas/nexio-ext-loader';

import { frameTitleWidget } from './nexio-frame-title-widget';
import { effects } from './effects';

export class FrameTitleViewExtension extends ViewExtensionProvider {
  override name = 'nexio-frame-title-widget';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    if (context.scope === 'edgeless') {
      context.register(frameTitleWidget);
    }
  }
}
