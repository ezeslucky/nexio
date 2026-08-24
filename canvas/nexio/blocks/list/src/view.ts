import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { BlockViewExtension, FlavourExtension } from '@canvas/std';
import { literal } from 'lit/static-html.js';

import { effects } from './effects.js';
import { ListKeymapExtension, ListTextKeymapExtension } from './list-keymap.js';
import { ListMarkdownExtension } from './markdown.js';

export class ListViewExtension extends ViewExtensionProvider {
  override name = 'nexio-list-block';

  override effect(): void {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    context.register([
      FlavourExtension('nexio:list'),
      BlockViewExtension('nexio:list', literal`nexio-list`),
      ListKeymapExtension,
      ListTextKeymapExtension,
      ListMarkdownExtension,
    ]);
  }
}
