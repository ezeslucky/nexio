import {
  type ViewExtensionContext,
  ViewExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { ParagraphBlockModel } from '@canvas/nexio-model';
import { BlockViewExtension, FlavourExtension } from '@canvas/std';
import { literal } from 'lit/static-html.js';
import { z } from 'zod';

import { effects } from './effects';
import { ParagraphMarkdownExtension } from './markdown.js';
import { ParagraphBlockConfigExtension } from './paragraph-block-config.js';
import {
  ParagraphKeymapExtension,
  ParagraphTextKeymapExtension,
} from './paragraph-keymap.js';

const placeholders = {
  text: "Type '/' for commands",
  h1: 'Heading 1',
  h2: 'Heading 2',
  h3: 'Heading 3',
  h4: 'Heading 4',
  h5: 'Heading 5',
  h6: 'Heading 6',
  quote: '',
};

const optionsSchema = z.object({
  getPlaceholder: z.optional(
    z.function().args(z.instanceof(ParagraphBlockModel)).returns(z.string())
  ),
});

export class ParagraphViewExtension extends ViewExtensionProvider<
  z.infer<typeof optionsSchema>
> {
  override name = 'nexio-paragraph-block';

  override schema = optionsSchema;

  override effect(): void {
    super.effect();
    effects();
  }

  override setup(
    context: ViewExtensionContext,
    options?: z.infer<typeof optionsSchema>
  ) {
    super.setup(context, options);
    const getPlaceholder =
      options?.getPlaceholder ?? (model => placeholders[model.props.type]);

    context.register([
      FlavourExtension('nexio:paragraph'),
      BlockViewExtension('nexio:paragraph', literal`nexio-paragraph`),
      ParagraphTextKeymapExtension,
      ParagraphKeymapExtension,
      ParagraphBlockConfigExtension({
        getPlaceholder,
      }),
      ParagraphMarkdownExtension,
    ]);
  }
}
