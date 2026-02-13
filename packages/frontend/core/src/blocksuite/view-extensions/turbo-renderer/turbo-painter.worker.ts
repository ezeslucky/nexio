import { CodeLayoutPainterExtension } from '@blocksuite/nexio/blocks/code';
import { ImageLayoutPainterExtension } from '@blocksuite/nexio/blocks/image';
import { ListLayoutPainterExtension } from '@blocksuite/nexio/blocks/list';
import { NoteLayoutPainterExtension } from '@blocksuite/nexio/blocks/note';
import { ParagraphLayoutPainterExtension } from '@blocksuite/nexio/blocks/paragraph';
import { ViewportLayoutPainter } from '@blocksuite/nexio/gfx/turbo-renderer';

new ViewportLayoutPainter([
  ParagraphLayoutPainterExtension,
  ListLayoutPainterExtension,
  NoteLayoutPainterExtension,
  CodeLayoutPainterExtension,
  ImageLayoutPainterExtension,
]);
