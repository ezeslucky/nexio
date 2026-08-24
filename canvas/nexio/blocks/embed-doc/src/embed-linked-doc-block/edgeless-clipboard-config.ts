import { EdgelessClipboardConfig } from '@canvas/nexio-block-surface';
import { ReferenceInfoSchema } from '@canvas/nexio-model';
import { type BlockSnapshot } from '@canvas/store';

export class EdgelessClipboardEmbedLinkedDocConfig extends EdgelessClipboardConfig {
  static override readonly key = 'nexio:embed-linked-doc';

  override createBlock(linkedDocEmbed: BlockSnapshot): string | null {
    if (!this.surface) return null;

    const { xywh, style, caption, pageId, params, title, description } =
      linkedDocEmbed.props;
    const referenceInfo = ReferenceInfoSchema.parse({
      pageId,
      params,
      title,
      description,
    });

    return this.crud.addBlock(
      'nexio:embed-linked-doc',
      {
        xywh,
        style,
        caption,
        ...referenceInfo,
      },
      this.surface.model.id
    );
  }
}
