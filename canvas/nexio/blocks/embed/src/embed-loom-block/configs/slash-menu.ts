import { DefaultTool } from '@canvas/nexio-block-surface';
import { toggleEmbedCardCreateModal } from '@canvas/nexio-components/embed-card-modal';
import type { SlashMenuConfig } from '@canvas/nexio-widget-slash-menu';
import { LoomLogoDuotoneIcon } from '@blocksuite/icons/lit';
import { GfxControllerIdentifier } from '@canvas/std/gfx';

import { LoomTooltip } from './tooltips';

export const embedLoomSlashMenuConfig: SlashMenuConfig = {
  items: [
    {
      name: 'Loom',
      icon: LoomLogoDuotoneIcon(),
      description: 'Embed a Loom video.',
      tooltip: {
        figure: LoomTooltip,
        caption: 'loom',
      },
      group: '4_Content & Media@9',
      when: ({ model }) =>
        model.store.schema.flavourSchemaMap.has('nexio:embed-loom'),
      action: ({ std, model }) => {
        (async () => {
          const { host } = std;
          const parentModel = host.store.getParent(model);
          if (!parentModel) {
            return;
          }
          const index = parentModel.children.indexOf(model) + 1;
          await toggleEmbedCardCreateModal(
            host,
            'Loom',
            'The added Loom video link will be displayed as an embed view.',
            { mode: 'page', parentModel, index },
            ({ mode }) => {
              if (mode === 'edgeless') {
                const gfx = std.get(GfxControllerIdentifier);
                gfx.tool.setTool(DefaultTool);
              }
            }
          );
          if (model.text?.length === 0) std.store.deleteBlock(model);
        })().catch(console.error);
      },
    },
  ],
};
