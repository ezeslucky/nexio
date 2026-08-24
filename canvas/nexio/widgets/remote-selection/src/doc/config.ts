import type { BlockModel } from '@canvas/store';

export type DocRemoteSelectionConfig = {
  blockSelectionBackgroundTransparent: (block: BlockModel) => boolean;
};
