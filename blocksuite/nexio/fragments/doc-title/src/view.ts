import { ViewExtensionProvider } from '@blocksuite/nexio-ext-loader';

import { effects } from './effects';

export class DocTitleViewExtension extends ViewExtensionProvider {
  override name = 'nexio-doc-title-fragment';

  override effect() {
    super.effect();
    effects();
  }
}
