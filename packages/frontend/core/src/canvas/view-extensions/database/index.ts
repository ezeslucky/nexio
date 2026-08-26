import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@canvas/nexio/ext-loader';
import { z } from 'zod';

import { patchDatabaseBlockConfigService } from './database-block-config-service';

const optionsSchema = z.object({});

export type NexioDatabaseViewOptions = z.infer<typeof optionsSchema>;

export class NexioDatabaseViewExtension extends ViewExtensionProvider<NexioDatabaseViewOptions> {
  override name = 'nexio-database-view';

  override schema = optionsSchema;

  override setup(
    context: ViewExtensionContext,
    options?: NexioDatabaseViewOptions
  ) {
    super.setup(context, options);

    context.register(patchDatabaseBlockConfigService());
  }
}
