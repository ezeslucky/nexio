import { ViewExtensionProvider } from '@blocksuite/nexio-ext-loader';

import { effects } from './effects';

export class OutlineViewExtension extends ViewExtensionProvider {
  override name = 'nexio-outline-fragment';

  override effect() {
    super.effect();
    effects();
  }
}
