import { type DropTargetDropEvent, useDropTarget } from '@nexio/component';
import type { AffineDNDData } from '@nexio/core/types/dnd';
import { useI18n } from '@nexio/i18n';

import { EmptyNodeChildren } from '../../layouts/empty-node-children';

export const Empty = ({
  onDrop,
}: {
  onDrop: (data: DropTargetDropEvent<AffineDNDData>) => void;
}) => {
  const { dropTargetRef } = useDropTarget(
    () => ({
      onDrop,
    }),
    [onDrop]
  );
  const t = useI18n();
  return (
    <EmptyNodeChildren ref={dropTargetRef}>
      {t['com.affine.rootAppSidebar.tags.no-doc']()}
    </EmptyNodeChildren>
  );
};
