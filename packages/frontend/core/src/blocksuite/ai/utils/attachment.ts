import { AttachmentBlockModel } from '@canvas/nexio/model';
import type { BlockModel } from '@canvas/nexio/store';
import type { GfxModel } from '@canvas/std/gfx';

export function isAttachment(
  model: GfxModel | BlockModel
): model is AttachmentBlockModel {
  return model instanceof AttachmentBlockModel;
}
