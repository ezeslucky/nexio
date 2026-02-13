import { type DropTargetDropEvent, useDropTarget } from '@nexio/component';
import type { NexioDNDData } from '@nexio/core/types/dnd';
import { useI18n } from '@nexio/i18n';

import { EmptyNodeChildren } from '../../layouts/empty-node-children';

export const Empty = ({
  onDrop,
  noAccessible = false,
}: {
  onDrop: (data: DropTargetDropEvent<NexioDNDData>) => void;
  noAccessible?: boolean;
}) => {
  const { dropTargetRef } = useDropTarget<NexioDNDData>(
    () => ({
      onDrop,
    }),
    [onDrop]
  );
  const t = useI18n();

  return (
    <EmptyNodeChildren ref={dropTargetRef}>
      {noAccessible
        ? t['com.nexio.share-menu.option.permission.no-access']()
        : t['com.nexio.rootAppSidebar.docs.no-subdoc']()}
    </EmptyNodeChildren>
  );
};
