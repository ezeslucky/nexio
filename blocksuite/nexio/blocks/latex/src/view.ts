import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/nexio-ext-loader';
import { SlashMenuConfigExtension } from '@blocksuite/nexio-widget-slash-menu';
import { BlockViewExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';

import { latexSlashMenuConfig } from './configs/slash-menu';
import { effects } from './effects';

export class LatexViewExtension extends ViewExtensionProvider {
  override name = 'nexio-latex-block';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    context.register([
      BlockViewExtension('nexio:latex', literal`nexio-latex`),
      SlashMenuConfigExtension('nexio:latex', latexSlashMenuConfig),
    ]);
  }
}
