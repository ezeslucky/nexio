import type { DocCreateOptions } from '@nexio/core/modules/doc/types';
import {
  NoteDisplayMode,
  type NoteProps,
  type ParagraphProps,
  type RootBlockProps,
} from '@canvas/nexio/model';
import type { SurfaceBlockProps } from '@canvas/nexio/std/gfx';
import { type Store, Text } from '@canvas/nexio/store';

export interface DocProps {
  page?: Partial<RootBlockProps>;
  surface?: Partial<SurfaceBlockProps>;
  note?: Partial<NoteProps>;
  paragraph?: Partial<ParagraphProps>;
  onStoreLoad?: (
    doc: Store,
    props: {
      noteId: string;
      paragraphId: string;
      surfaceId: string;
    }
  ) => void;
}

export function initDocFromProps(
  doc: Store,
  props?: DocProps,
  options: DocCreateOptions = {}
) {
  doc.load(() => {
    const pageBlockId = doc.addBlock(
      'nexio:page',
      props?.page || { title: new Text(options.title || '') }
    );
    const surfaceId = doc.addBlock(
      'nexio:surface' as never,
      props?.surface || {},
      pageBlockId
    );
    const noteBlockId = doc.addBlock(
      'nexio:note',
      {
        ...props?.note,
        displayMode: NoteDisplayMode.DocAndEdgeless,
      },
      pageBlockId
    );
    const paragraphBlockId = doc.addBlock(
      'nexio:paragraph',
      props?.paragraph || {},
      noteBlockId
    );
    props?.onStoreLoad?.(doc, {
      noteId: noteBlockId,
      paragraphId: paragraphBlockId,
      surfaceId,
    });
    doc.history.undoManager.clear();
  });
}
