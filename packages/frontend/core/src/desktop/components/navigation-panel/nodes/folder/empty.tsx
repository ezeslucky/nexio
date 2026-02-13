import {
  type DropTargetDropEvent,
  type DropTargetOptions,
  useDropTarget,
} from '@nexio/component';
import type { NexioDNDData } from '@nexio/core/types/dnd';
import { useI18n } from '@nexio/i18n';

import { EmptyNodeChildren } from '../../layouts/empty-node-children';
import { draggedOverHighlight } from './empty.css';

export const FolderEmpty = ({
  canDrop,
  onDrop,
}: {
  onDrop?: (data: DropTargetDropEvent<NexioDNDData>) => void;
  canDrop?: DropTargetOptions<NexioDNDData>['canDrop'];
}) => {
  const { dropTargetRef } = useDropTarget(
    () => ({
      onDrop,
      canDrop,
    }),
    [onDrop, canDrop]
  );

  const t = useI18n();
  return (
    <EmptyNodeChildren ref={dropTargetRef} className={draggedOverHighlight}>
      {t['com.nexio.rootAppSidebar.organize.empty-folder']()}
    </EmptyNodeChildren>
  );
};
