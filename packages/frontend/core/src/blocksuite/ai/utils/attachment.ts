import { AttachmentBlockModel } from '@blocksuite/nexio/model';
import type { BlockModel } from '@blocksuite/nexio/store';
import type { GfxModel } from '@blocksuite/std/gfx';

export function isAttachment(
  model: GfxModel | BlockModel
): model is AttachmentBlockModel {
  return model instanceof AttachmentBlockModel;
}
