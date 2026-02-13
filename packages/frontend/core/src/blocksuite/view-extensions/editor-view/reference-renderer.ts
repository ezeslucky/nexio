import type { ReactToLit } from '@nexio/component';
import type { NexioReference } from '@blocksuite/nexio/inlines/reference';
import { ReferenceNodeConfigExtension } from '@blocksuite/nexio/inlines/reference';
import type { ExtensionType } from '@blocksuite/nexio/store';

export type ReferenceReactRenderer = (
  reference: NexioReference
) => React.ReactElement;

export function patchReferenceRenderer(
  reactToLit: ReactToLit,
  reactRenderer: ReferenceReactRenderer
): ExtensionType {
  const customContent = (reference: NexioReference) => {
    const node = reactRenderer(reference);
    return reactToLit(node, true);
  };

  return ReferenceNodeConfigExtension({
    customContent,
    hidePopup: BUILD_CONFIG.isMobileEdition,
  });
}
