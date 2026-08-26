import { CodeLayoutPainterExtension } from '@canvas/nexio/blocks/code';
import { ImageLayoutPainterExtension } from '@canvas/nexio/blocks/image';
import { ListLayoutPainterExtension } from '@canvas/nexio/blocks/list';
import { NoteLayoutPainterExtension } from '@canvas/nexio/blocks/note';
import { ParagraphLayoutPainterExtension } from '@canvas/nexio/blocks/paragraph';
import { ViewportLayoutPainter } from '@canvas/nexio/gfx/turbo-renderer';

new ViewportLayoutPainter([
  ParagraphLayoutPainterExtension,
  ListLayoutPainterExtension,
  NoteLayoutPainterExtension,
  CodeLayoutPainterExtension,
  ImageLayoutPainterExtension,
]);
