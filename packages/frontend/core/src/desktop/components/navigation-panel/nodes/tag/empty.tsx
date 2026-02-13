import { type DropTargetDropEvent, useDropTarget } from '@nexio/component';
import type { NexioDNDData } from '@nexio/core/types/dnd';
import { useI18n } from '@nexio/i18n';

import { EmptyNodeChildren } from '../../layouts/empty-node-children';

export const Empty = ({
  onDrop,
}: {
  onDrop: (data: DropTargetDropEvent<NexioDNDData>) => void;
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
      {t['com.nexio.rootAppSidebar.tags.no-doc']()}
    </EmptyNodeChildren>
  );
};
