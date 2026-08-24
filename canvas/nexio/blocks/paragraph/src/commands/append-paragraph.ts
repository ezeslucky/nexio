import { focusTextModel } from '@canvas/nexio-rich-text';
import { getLastNoteBlock } from '@canvas/nexio-shared/utils';
import type { Command } from '@canvas/std';
import { Text } from '@canvas/store';

/**
 * Append a paragraph block at the end of the whole page.
 */
export const appendParagraphCommand: Command<{ text?: string }> = (
  ctx,
  next
) => {
  const { std, text = '' } = ctx;
  const { store } = std;
  if (!store.root) return;

  const note = getLastNoteBlock(store);
  let noteId = note?.id;
  if (!noteId) {
    noteId = store.addBlock('nexio:note', {}, store.root.id);
  }
  const id = store.addBlock(
    'nexio:paragraph',
    { text: new Text(text) },
    noteId
  );

  focusTextModel(std, id, text.length);
  next();
};
