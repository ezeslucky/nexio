import { DefaultTool } from '@canvas/nexio-block-surface';
import { toggleEmbedCardCreateModal } from '@canvas/nexio-components/embed-card-modal';
import type { SlashMenuConfig } from '@canvas/nexio-widget-slash-menu';
import { GithubDuotoneIcon } from '@canvas/icons/lit';
import { GfxControllerIdentifier } from '@canvas/std/gfx';

import { GithubRepoTooltip } from './tooltips';

export const embedGithubSlashMenuConfig: SlashMenuConfig = {
  items: [
    {
      name: 'GitHub',
      description: 'Link to a GitHub repository.',
      icon: GithubDuotoneIcon(),
      tooltip: {
        figure: GithubRepoTooltip,
        caption: 'GitHub Repo',
      },
      group: '4_Content & Media@7',
      when: ({ model }) =>
        model.store.schema.flavourSchemaMap.has('nexio:embed-github'),
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
            'GitHub',
            'The added GitHub issue or pull request link will be displayed as a card view.',
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
