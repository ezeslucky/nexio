import { textKeymap } from '@canvas/nexio-inline-preset';
import { CodeBlockSchema } from '@canvas/nexio-model';
import { KeymapExtension } from '@canvas/std';

export const CodeKeymapExtension = KeymapExtension(textKeymap, {
  flavour: CodeBlockSchema.model.flavour,
});
