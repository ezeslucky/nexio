import { ViewExtensionProvider } from '@blocksuite/nexio-ext-loader';

import { effects } from './effects';

export class AdapterPanelViewExtension extends ViewExtensionProvider {
  override name = 'nexio-adapter-panel-fragment';

  override effect() {
    super.effect();
    effects();
  }
}
