import { EdgelessClipboardConfig } from '@canvas/nexio-block-surface';
import { ReferenceInfoSchema } from '@canvas/nexio-model';
import { type BlockSnapshot } from '@canvas/store';

export class EdgelessClipboardEmbedSyncedDocConfig extends EdgelessClipboardConfig {
  static override readonly key = 'nexio:embed-synced-doc';

  override createBlock(syncedDocEmbed: BlockSnapshot): string | null {
    if (!this.surface) return null;

    const { xywh, style, caption, scale, pageId, params } =
      syncedDocEmbed.props;
    const referenceInfo = ReferenceInfoSchema.parse({ pageId, params });

    return this.crud.addBlock(
      'nexio:embed-synced-doc',
      {
        xywh,
        style,
        caption,
        scale,
        ...referenceInfo,
      },
      this.surface.model.id
    );
  }
}
