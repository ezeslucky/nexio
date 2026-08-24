import {
  type DividerBlockModel,
  DividerBlockSchema,
  ParagraphBlockModel,
  ParagraphBlockSchema,
} from '@canvas/nexio-model';
import { focusTextModel } from '@canvas/nexio-rich-text';
import type { NexioTextAttributes } from '@canvas/nexio-shared/types';
import { matchModels } from '@canvas/nexio-shared/utils';
import type { BlockComponent } from '@canvas/std';
import { InlineMarkdownExtension } from '@canvas/std/inline';

export const DividerMarkdownExtension =
  InlineMarkdownExtension<NexioTextAttributes>({
    name: 'divider',
    pattern: /^(-{3,}|\*{3,}|_{3,})\s$/,
    action: ({ inlineEditor, inlineRange }) => {
      if (inlineEditor.yTextString.slice(0, inlineRange.index).includes('\n')) {
        return;
      }

      if (!inlineEditor.rootElement) return;
      const blockComponent =
        inlineEditor.rootElement.closest<BlockComponent>('[data-block-id]');
      if (!blockComponent) return;

      const { model, std, store } = blockComponent;

      if (
        matchModels(model, [ParagraphBlockModel]) &&
        model.props.type !== 'quote'
      ) {
        const parent = store.getParent(model);
        if (!parent) return;
        const index = parent.children.indexOf(model);

        store.captureSync();
        inlineEditor.deleteText({
          index: 0,
          length: inlineRange.index,
        });
        store.addBlock<DividerBlockModel>(
          DividerBlockSchema.model.flavour,
          {
            children: model.children,
          },
          parent,
          index
        );

        const nextBlock = parent.children.at(index + 1);
        let id = nextBlock?.id;
        if (!id) {
          id = store.addBlock<ParagraphBlockModel>(
            ParagraphBlockSchema.model.flavour,
            {},
            parent
          );
        }
        focusTextModel(std, id);
      }
    },
  });
