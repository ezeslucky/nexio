import { getSelectedModelsCommand } from '@canvas/nexio-shared/commands';
import { TelemetryProvider } from '@canvas/nexio-shared/services';
import { isInsideBlockByFlavour } from '@canvas/nexio-shared/utils';
import type { SlashMenuConfig } from '@canvas/nexio-widget-slash-menu';
import { TableIcon } from '@canvas/icons/lit';

import { insertTableBlockCommand } from '../commands';
import { tableTooltip } from './tooltips';

export const tableSlashMenuConfig: SlashMenuConfig = {
  disableWhen: ({ model }) => model.flavour === 'nexio:table',
  items: [
    {
      name: 'Table',
      description: 'Create a simple table.',
      icon: TableIcon(),
      tooltip: {
        figure: tableTooltip,
        caption: 'Table',
      },
      group: '4_Content & Media@0',
      when: ({ model }) =>
        !isInsideBlockByFlavour(model.store, model, 'nexio:edgeless-text'),
      action: ({ std }) => {
        std.command
          .chain()
          .pipe(getSelectedModelsCommand)
          .pipe(insertTableBlockCommand, {
            place: 'after',
            removeEmptyLine: true,
          })
          .pipe(({ insertedTableBlockId }) => {
            if (insertedTableBlockId) {
              const telemetry = std.getOptional(TelemetryProvider);
              telemetry?.track('BlockCreated', {
                blockType: 'nexio:table',
              });
            }
          })
          .run();
      },
    },
  ],
};
