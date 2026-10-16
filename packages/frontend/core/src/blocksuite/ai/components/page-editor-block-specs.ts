import { ViewExtensionManager } from '@blocksuite/nexio/ext-loader';
import { getInternalViewExtensions } from '@blocksuite/nexio/extensions/view';
import { BlockViewIdentifier } from '@blocksuite/nexio/std';
import type { ExtensionType } from '@blocksuite/nexio/store';
import { literal } from 'lit/static-html.js';

const manager = new ViewExtensionManager([...getInternalViewExtensions()]);
const customPageEditorBlockSpecs: ExtensionType[] = [
  ...manager.get('page'),
  {
    setup: di => {
      di.override(
        BlockViewIdentifier('affine:page'),
        () => literal`affine-page-root`
      );
    },
  },
];

export const getCustomPageEditorBlockSpecs = () => {
  return customPageEditorBlockSpecs;
};
