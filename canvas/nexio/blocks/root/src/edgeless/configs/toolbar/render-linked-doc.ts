import { isFrameBlock } from '@canvas/nexio-block-frame';
import { getSurfaceBlock, isNoteBlock } from '@canvas/nexio-block-surface';
import {
  type FrameBlockModel,
  type NoteBlockModel,
  NoteDisplayMode,
} from '@canvas/nexio-model';
import { replaceIdMiddleware } from '@canvas/nexio-shared/adapters';
import { DocModeProvider } from '@canvas/nexio-shared/services';
import { getBlockProps } from '@canvas/nexio-shared/utils';
import type { EditorHost } from '@canvas/std';
import { GfxBlockElementModel, type GfxModel } from '@canvas/std/gfx';
import { type Store, Text } from '@canvas/store';

import {
  getElementProps,
  mapFrameIds,
  sortEdgelessElements,
} from '../../../edgeless/utils/clone-utils.js';

export function createLinkedDocFromNote(
  doc: Store,
  note: NoteBlockModel,
  docTitle?: string
) {
  const _doc = doc.workspace.createDoc();
  const transformer = doc.getTransformer([
    replaceIdMiddleware(doc.workspace.idGenerator),
  ]);
  const blockSnapshot = transformer.blockToSnapshot(note);
  if (!blockSnapshot) {
    console.error('Failed to create linked doc from note');
    return;
  }
  blockSnapshot.props.displayMode = NoteDisplayMode.DocAndEdgeless;
  const linkedDoc = _doc.getStore({ id: doc.id });
  linkedDoc.load(() => {
    const rootId = linkedDoc.addBlock('nexio:page', {
      title: new Text(docTitle),
    });
    linkedDoc.addBlock('nexio:surface', {}, rootId);
    transformer
      .snapshotToBlock(blockSnapshot, linkedDoc, rootId)
      .catch(console.error);
  });

  return linkedDoc;
}

export function createLinkedDocFromEdgelessElements(
  host: EditorHost,
  elements: GfxModel[],
  docTitle?: string
) {
  const _doc = host.store.workspace.createDoc();
  const transformer = host.store.getTransformer();
  const linkedDoc = _doc.getStore();
  linkedDoc.load(() => {
    const rootId = linkedDoc.addBlock('nexio:page', {
      title: new Text(docTitle),
    });
    const surfaceId = linkedDoc.addBlock('nexio:surface', {}, rootId);
    const surface = getSurfaceBlock(linkedDoc);
    if (!surface) return;

    const sortedElements = sortEdgelessElements(elements);
    const ids = new Map<string, string>();
    sortedElements.forEach(model => {
      let newId = model.id;
      if (model instanceof GfxBlockElementModel) {
        const blockProps = getBlockProps(model);
        if (isNoteBlock(model)) {
          const blockSnapshot = transformer.blockToSnapshot(model);
          if (blockSnapshot) {
            transformer
              .snapshotToBlock(blockSnapshot, linkedDoc, rootId)
              .catch(console.error);
          }
        } else {
          if (isFrameBlock(model)) {
            mapFrameIds(blockProps as FrameBlockModel['props'], ids);
          }

          newId = linkedDoc.addBlock(model.flavour, blockProps, surfaceId);
        }
      } else {
        const props = getElementProps(model, ids);
        newId = surface.addElement(props);
      }
      ids.set(model.id, newId);
    });
  });

  host.std.get(DocModeProvider).setPrimaryMode('edgeless', linkedDoc.id);
  return linkedDoc;
}
