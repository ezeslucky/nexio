import { EdgelessClipboardConfig } from '@canvas/nexio-block-surface';
import { type BlockSnapshot } from '@canvas/store';

export class EdgelessClipboardEmbedFigmaConfig extends EdgelessClipboardConfig {
  static override readonly key = 'nexio:embed-figma';

  override createBlock(figmaEmbed: BlockSnapshot): string | null {
    if (!this.surface) return null;
    const { xywh, style, url, caption, title, description } = figmaEmbed.props;

    const embedFigmaId = this.crud.addBlock(
      'nexio:embed-figma',
      {
        xywh,
        style,
        url,
        caption,
        title,
        description,
      },
      this.surface.model.id
    );
    return embedFigmaId;
  }
}
