import { textKeymap } from '@blocksuite/nexio-inline-preset';
import { TableBlockSchema } from '@blocksuite/nexio-model';
import { KeymapExtension } from '@blocksuite/std';

export const TableKeymapExtension = KeymapExtension(textKeymap, {
  flavour: TableBlockSchema.model.flavour,
});
