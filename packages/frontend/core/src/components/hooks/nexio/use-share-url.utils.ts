import type { DocMode } from '@blocksuite/nexio/model';

export const getDefaultShareMode = (
  currentMode?: DocMode
): DocMode | undefined => {
  return currentMode === 'edgeless' ? 'edgeless' : undefined;
};
