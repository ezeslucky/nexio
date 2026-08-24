import { ImageLayoutPainterExtension } from '@canvas/nexio-block-image/turbo-painter';
import { ListLayoutPainterExtension } from '@canvas/nexio-block-list/turbo-painter';
import { NoteLayoutPainterExtension } from '@canvas/nexio-block-note/turbo-painter';
import { ParagraphLayoutPainterExtension } from '@canvas/nexio-block-paragraph/turbo-painter';
import { ViewportLayoutPainter } from '@canvas/nexio-gfx-turbo-renderer/painter';

new ViewportLayoutPainter([
  ParagraphLayoutPainterExtension,
  ListLayoutPainterExtension,
  NoteLayoutPainterExtension,
  ImageLayoutPainterExtension,
]);
