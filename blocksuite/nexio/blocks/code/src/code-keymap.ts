import { textKeymap } from '@blocksuite/nexio-inline-preset';
import { CodeBlockSchema } from '@blocksuite/nexio-model';
import { KeymapExtension } from '@blocksuite/std';

export const CodeKeymapExtension = KeymapExtension(textKeymap, {
  flavour: CodeBlockSchema.model.flavour,
});
