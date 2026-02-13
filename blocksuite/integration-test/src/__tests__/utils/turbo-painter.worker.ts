import { ImageLayoutPainterExtension } from '@blocksuite/nexio-block-image/turbo-painter';
import { ListLayoutPainterExtension } from '@blocksuite/nexio-block-list/turbo-painter';
import { NoteLayoutPainterExtension } from '@blocksuite/nexio-block-note/turbo-painter';
import { ParagraphLayoutPainterExtension } from '@blocksuite/nexio-block-paragraph/turbo-painter';
import { ViewportLayoutPainter } from '@blocksuite/nexio-gfx-turbo-renderer/painter';

new ViewportLayoutPainter([
  ParagraphLayoutPainterExtension,
  ListLayoutPainterExtension,
  NoteLayoutPainterExtension,
  ImageLayoutPainterExtension,
]);
