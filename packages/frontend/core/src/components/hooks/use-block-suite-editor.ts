import type { SetStateAction } from 'jotai';
import { atom, useAtom } from 'jotai';

import type { NexioEditorContainer } from '../../canvas/block-suite-editor';

const activeEditorContainerAtom = atom<NexioEditorContainer | null>(null);

export function useActiveCanvasEditor(): [
  NexioEditorContainer | null,
  React.Dispatch<SetStateAction<NexioEditorContainer | null>>,
] {
  const [editorContainer, setEditorContainer] = useAtom(
    activeEditorContainerAtom
  );

  return [editorContainer, setEditorContainer];
}
