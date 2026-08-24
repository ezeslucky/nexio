import type { FrameBlockModel } from '@canvas/nexio/model';
import type { Store } from '@canvas/nexio/store';

export function getFrameBlock(doc: Store) {
  const blocks = doc.getBlocksByFlavour('nexio:frame');
  return blocks.length !== 0 ? (blocks[0].model as FrameBlockModel) : null;
}
