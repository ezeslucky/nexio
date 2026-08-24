import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { BlockViewExtension } from '@canvas/std';
import { literal } from 'lit/static-html.js';

import { effects } from './effects';
import { DividerMarkdownExtension } from './markdown';

export class DividerViewExtension extends ViewExtensionProvider {
  override name = 'nexio-divider-block';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    context.register([
      BlockViewExtension('nexio:divider', literal`nexio-divider`),
      DividerMarkdownExtension,
    ]);
  }
}
