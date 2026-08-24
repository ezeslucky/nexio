import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { IS_MOBILE } from '@canvas/global/env';

import { effects } from './effects';
import { keyboardToolbarWidget } from './widget';

export class KeyboardToolbarViewExtension extends ViewExtensionProvider {
  override name = 'nexio-keyboard-toolbar-widget';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    if (
      context.scope === 'mobile-page' ||
      // Legacy mobile page
      (context.scope === 'page' && IS_MOBILE)
    ) {
      context.register(keyboardToolbarWidget);
    }
  }
}
