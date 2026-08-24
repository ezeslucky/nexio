import type {
  BlockLayout,
  BlockLayoutPainter,
  WorkerToHostMessage,
} from '@canvas/nexio-gfx-turbo-renderer';
import { BlockLayoutPainterExtension } from '@canvas/nexio-gfx-turbo-renderer/painter';

export interface NoteLayout extends BlockLayout {
  type: 'nexio:note';
  background?: string;
}

function isNoteLayout(layout: BlockLayout): layout is NoteLayout {
  return layout.type === 'nexio:note';
}

class NoteLayoutPainter implements BlockLayoutPainter {
  paint(
    ctx: OffscreenCanvasRenderingContext2D,
    layout: BlockLayout,
    layoutBaseX: number,
    layoutBaseY: number
  ): void {
    if (!isNoteLayout(layout)) {
      const message: WorkerToHostMessage = {
        type: 'paintError',
        error: 'Invalid layout format',
        blockType: 'nexio:note',
      };
      self.postMessage(message);
      return;
    }

    // Get the layout rectangle
    const x = layout.rect.x - layoutBaseX;
    const y = layout.rect.y - layoutBaseY;
    const width = layout.rect.w;
    const height = layout.rect.h;

    ctx.fillStyle = layout.background || 'rgb(255, 255, 255)';
    ctx.fillRect(x, y, width, height);
    ctx.strokeRect(x, y, width, height);
  }
}

export const NoteLayoutPainterExtension = BlockLayoutPainterExtension(
  'nexio:note',
  NoteLayoutPainter
);
