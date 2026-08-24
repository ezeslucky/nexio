import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { TableModelFlavour } from '@canvas/nexio-model';
import { SlashMenuConfigExtension } from '@canvas/nexio-widget-slash-menu';
import { BlockViewExtension, FlavourExtension } from '@canvas/std';
import { literal } from 'lit/static-html.js';

import { tableSlashMenuConfig } from './configs/slash-menu';
import { effects } from './effects';

export class TableViewExtension extends ViewExtensionProvider {
  override name = 'nexio-table-block';

  override effect(): void {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    context.register([
      FlavourExtension(TableModelFlavour),
      BlockViewExtension(TableModelFlavour, literal`nexio-table`),
      SlashMenuConfigExtension(TableModelFlavour, tableSlashMenuConfig),
    ]);
  }
}
