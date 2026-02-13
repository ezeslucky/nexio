import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/nexio-ext-loader';
import { SlashMenuConfigExtension } from '@blocksuite/nexio-widget-slash-menu';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';

import { CalloutKeymapExtension } from './callout-keymap';
import { calloutSlashMenuConfig } from './configs/slash-menu';
import { createBuiltinToolbarConfigExtension } from './configs/toolbar';
import { effects } from './effects';

export class CalloutViewExtension extends ViewExtensionProvider {
  override name = 'nexio-callout-block';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    context.register([
      FlavourExtension('nexio:callout'),
      BlockViewExtension('nexio:callout', literal`nexio-callout`),
      CalloutKeymapExtension,
      SlashMenuConfigExtension('nexio:callout', calloutSlashMenuConfig),
      ...createBuiltinToolbarConfigExtension('nexio:callout'),
    ]);
  }
}
