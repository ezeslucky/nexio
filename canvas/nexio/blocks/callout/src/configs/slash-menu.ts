import { focusBlockEnd } from '@canvas/nexio-shared/commands';
import { FeatureFlagService } from '@canvas/nexio-shared/services';
import { isInsideBlockByFlavour } from '@canvas/nexio-shared/utils';
import { type SlashMenuConfig } from '@canvas/nexio-widget-slash-menu';
import { FontIcon } from '@canvas/icons/lit';

import { calloutTooltip } from './tooltips';

export const calloutSlashMenuConfig: SlashMenuConfig = {
  items: [
    {
      name: 'Callout',
      description: 'Let your words stand out.',
      icon: FontIcon(),
      tooltip: {
        figure: calloutTooltip,
        caption: 'Callout',
      },
      searchAlias: ['callout'],
      group: '0_Basic@9',
      when: ({ std, model }) => {
        return (
          std.get(FeatureFlagService).getFlag('enable_callout') &&
          !isInsideBlockByFlavour(model.store, model, 'nexio:edgeless-text')
        );
      },
      action: ({ model, std }) => {
        const { store } = model;
        const parent = store.getParent(model);
        if (!parent) return;

        const index = parent.children.indexOf(model);
        if (index === -1) return;
        const calloutId = store.addBlock(
          'nexio:callout',
          {},
          parent,
          index + 1
        );
        if (!calloutId) return;
        const paragraphId = store.addBlock('nexio:paragraph', {}, calloutId);
        if (!paragraphId) return;
        std.host.updateComplete
          .then(() => {
            const paragraph = std.view.getBlock(paragraphId);
            if (!paragraph) return;
            std.command.exec(focusBlockEnd, {
              focusBlock: paragraph,
            });
          })
          .catch(console.error);
      },
    },
  ],
};
