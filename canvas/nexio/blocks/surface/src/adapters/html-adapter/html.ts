import {
  BlockHtmlAdapterExtension,
  type BlockHtmlAdapterMatcher,
} from '@canvas/nexio-shared/adapters';

export const surfaceBlockHtmlAdapterMatcher: BlockHtmlAdapterMatcher = {
  flavour: 'nexio:surface',
  toMatch: () => false,
  fromMatch: o => o.node.flavour === 'nexio:surface',
  toBlockSnapshot: {},
  fromBlockSnapshot: {
    enter: (_, context) => {
      context.walkerContext.skipAllChildren();
    },
  },
};

export const SurfaceBlockHtmlAdapterExtension = BlockHtmlAdapterExtension(
  surfaceBlockHtmlAdapterMatcher
);
