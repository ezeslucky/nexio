import { REFERENCE_NODE } from '@canvas/nexio-shared/consts';
import type { NexioInlineEditor } from '@canvas/nexio-shared/types';

export function insertLinkedNode({
  inlineEditor,
  docId,
}: {
  inlineEditor: NexioInlineEditor;
  docId: string;
}) {
  if (!inlineEditor) return;
  const inlineRange = inlineEditor.getInlineRange();
  if (!inlineRange) return;
  inlineEditor.insertText(inlineRange, REFERENCE_NODE, {
    reference: { type: 'LinkedPage', pageId: docId },
  });
  inlineEditor.setInlineRange({
    index: inlineRange.index + 1,
    length: 0,
  });
}
