import { AttachmentViewer } from '@nexio/core/canvas/attachment-viewer';
import type { AttachmentBlockModel } from '@canvas/nexio/model';
import { useMemo } from 'react';

import { useEditor } from '../utils';

export type AttachmentPreviewModalProps = {
  docId: string;
  blockId: string;
};

export const AttachmentPreviewPeekView = ({
  docId,
  blockId,
}: AttachmentPreviewModalProps) => {
  const { doc } = useEditor(docId);
  const canvasDoc = doc?.canvasDoc;
  const model = useMemo(
    () => canvasDoc?.getModelById<AttachmentBlockModel>(blockId) ?? null,
    [blockId, canvasDoc]
  );

  if (model) {
    return <AttachmentViewer model={model} />;
  }

  return null;
};
