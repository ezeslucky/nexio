import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { AttachmentBlockSchema } from '@canvas/nexio-model';
import { SlashMenuConfigExtension } from '@canvas/nexio-widget-slash-menu';
import { BlockViewExtension, FlavourExtension } from '@canvas/std';
import { literal } from 'lit/static-html.js';

import { AttachmentBlockInteraction } from './attachment-edgeless-block.js';
import { AttachmentDropOption } from './attachment-service.js';
import { attachmentSlashMenuConfig } from './configs/slash-menu.js';
import { createBuiltinToolbarConfigExtension } from './configs/toolbar';
import { EdgelessClipboardAttachmentConfig } from './edgeless-clipboard-config';
import { effects } from './effects.js';
import {
  AttachmentEmbedConfigExtension,
  AttachmentEmbedService,
} from './embed';

const flavour = AttachmentBlockSchema.model.flavour;

export class AttachmentViewExtension extends ViewExtensionProvider {
  override name = 'nexio-attachment-block';

  override effect() {
    super.effect();
    effects();
  }

  override setup(context: ViewExtensionContext) {
    super.setup(context);
    context.register([
      FlavourExtension(flavour),
      BlockViewExtension(flavour, model => {
        return model.parent?.flavour === 'nexio:surface'
          ? literal`nexio-edgeless-attachment`
          : literal`nexio-attachment`;
      }),
      AttachmentDropOption,
      AttachmentEmbedConfigExtension(),
      AttachmentEmbedService,
      SlashMenuConfigExtension(flavour, attachmentSlashMenuConfig),
      ...createBuiltinToolbarConfigExtension(flavour),
    ]);
    if (this.isEdgeless(context.scope)) {
      context.register(EdgelessClipboardAttachmentConfig);
      context.register(AttachmentBlockInteraction);
    }
  }
}
