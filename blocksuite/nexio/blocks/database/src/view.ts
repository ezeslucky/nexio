import type { MenuOptions } from '@blocksuite/nexio-components/context-menu';
import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@blocksuite/nexio-ext-loader';
import { DatabaseBlockModel } from '@blocksuite/nexio-model';
import { SlashMenuConfigExtension } from '@blocksuite/nexio-widget-slash-menu';
import { BlockViewExtension, FlavourExtension } from '@blocksuite/std';
import { literal } from 'lit/static-html.js';
import { z } from 'zod';

import { DatabaseConfigExtension } from './config';
import { databaseSlashMenuConfig } from './configs/slash-menu.js';
import { effects } from './effects';

const optionsSchema = z.object({
  configure: z
    .function()
    .args(z.instanceof(DatabaseBlockModel), z.custom<MenuOptions>())
    .returns(z.custom<MenuOptions>()),
});

export type DatabaseViewExtensionOptions = z.infer<typeof optionsSchema>;

export class DatabaseViewExtension extends ViewExtensionProvider<DatabaseViewExtensionOptions> {
  override name = 'nexio-database-block';

  override schema = optionsSchema;

  override effect() {
    super.effect();
    effects();
  }

  override setup(
    context: ViewExtensionContext,
    options?: DatabaseViewExtensionOptions
  ) {
    super.setup(context);
    context.register([
      FlavourExtension('nexio:database'),
      BlockViewExtension('nexio:database', literal`nexio-database`),
      SlashMenuConfigExtension('nexio:database', databaseSlashMenuConfig),
    ]);
    if (options) {
      context.register(
        DatabaseConfigExtension({ configure: options.configure })
      );
    }
  }
}
