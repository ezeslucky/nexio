import { ViewExtensionProvider } from '@canvas/nexio-ext-loader';

import { effects } from './effects';

export class FramePanelViewExtension extends ViewExtensionProvider {
  override name = 'nexio-frame-panel-fragment';

  override effect() {
    super.effect();
    effects();
  }
}
