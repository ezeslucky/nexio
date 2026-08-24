import type { Connectable, NoteBlockModel } from '@canvas/nexio-model';
import type { GfxModel } from '@canvas/std/gfx';
import type { BlockModel } from '@canvas/store';

export function isConnectable(
  element: GfxModel | null
): element is Connectable {
  return !!element && element.connectable;
}

export function isNoteBlock(
  element: BlockModel | GfxModel | null
): element is NoteBlockModel {
  return !!element && 'flavour' in element && element.flavour === 'nexio:note';
}
