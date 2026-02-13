import type { FrameBlockModel } from '@blocksuite/nexio/model';
import type { Store } from '@blocksuite/nexio/store';

export function getFrameBlock(doc: Store) {
  const blocks = doc.getBlocksByFlavour('nexio:frame');
  return blocks.length !== 0 ? (blocks[0].model as FrameBlockModel) : null;
}
