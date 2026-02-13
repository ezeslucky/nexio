import { DividerBlockSchema } from '@blocksuite/nexio-model';
import {
  BlockPlainTextAdapterExtension,
  type BlockPlainTextAdapterMatcher,
} from '@blocksuite/nexio-shared/adapters';

export const dividerBlockPlainTextAdapterMatcher: BlockPlainTextAdapterMatcher =
  {
    flavour: DividerBlockSchema.model.flavour,
    toMatch: () => false,
    fromMatch: o => o.node.flavour === DividerBlockSchema.model.flavour,
    toBlockSnapshot: {},
    fromBlockSnapshot: {
      enter: (_, context) => {
        context.textBuffer.content += '---\n';
      },
    },
  };

export const DividerBlockPlainTextAdapterExtension =
  BlockPlainTextAdapterExtension(dividerBlockPlainTextAdapterMatcher);
