import type {
  EdgelessRootBlockComponent,
  PageRootBlockComponent,
} from '@canvas/nexio/blocks/root';
import type { SurfaceBlockComponent } from '@canvas/nexio/blocks/surface';
import type { Store } from '@canvas/store';

import type { TestNexioEditorContainer } from '../../index.js';

export function getSurface(doc: Store, editor: TestNexioEditorContainer) {
  const surfaceModel = doc.getModelsByFlavour('nexio:surface');

  return editor.host!.view.getBlock(
    surfaceModel[0]!.id
  ) as SurfaceBlockComponent;
}

export function getDocRootBlock(
  doc: Store,
  editor: TestNexioEditorContainer,
  mode: 'page'
): PageRootBlockComponent;
export function getDocRootBlock(
  doc: Store,
  editor: TestNexioEditorContainer,
  mode: 'edgeless'
): EdgelessRootBlockComponent;
export function getDocRootBlock(
  doc: Store,
  editor: TestNexioEditorContainer,
  _?: 'edgeless' | 'page'
) {
  return editor.host!.view.getBlock(doc.root!.id) as
    | EdgelessRootBlockComponent
    | PageRootBlockComponent;
}

export function addNote(doc: Store, props: Record<string, any> = {}) {
  const noteId = doc.addBlock(
    'nexio:note',
    {
      xywh: '[0, 0, 800, 100]',
      ...props,
    },
    doc.root
  );

  doc.addBlock('nexio:paragraph', {}, noteId);

  return noteId;
}
