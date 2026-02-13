import type { SetStateAction } from 'jotai';
import { atom, useAtom } from 'jotai';

import type { NexioEditorContainer } from '../../blocksuite/block-suite-editor';

const activeEditorContainerAtom = atom<NexioEditorContainer | null>(null);

export function useActiveBlocksuiteEditor(): [
  NexioEditorContainer | null,
  React.Dispatch<SetStateAction<NexioEditorContainer | null>>,
] {
  const [editorContainer, setEditorContainer] = useAtom(
    activeEditorContainerAtom
  );

  return [editorContainer, setEditorContainer];
}
