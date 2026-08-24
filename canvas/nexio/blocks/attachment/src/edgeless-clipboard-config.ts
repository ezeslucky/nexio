import { EdgelessClipboardConfig } from '@canvas/nexio-block-surface';
import { type BlockSnapshot } from '@canvas/store';

export class EdgelessClipboardAttachmentConfig extends EdgelessClipboardConfig {
  static override readonly key = 'nexio:attachment';

  override async createBlock(
    attachment: BlockSnapshot
  ): Promise<string | null> {
    if (!this.surface) return null;

    const { xywh, rotate, sourceId, name, size, type, embed, style } =
      attachment.props;

    if (!(await this.std.workspace.blobSync.get(sourceId as string))) {
      return null;
    }
    const attachmentId = this.crud.addBlock(
      'nexio:attachment',
      {
        xywh,
        rotate,
        sourceId,
        name,
        size,
        type,
        embed,
        style,
      },
      this.surface.model.id
    );
    return attachmentId;
  }
}
