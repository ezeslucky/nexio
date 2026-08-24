import type { LatexProps } from '@canvas/nexio-model';
import {
  DocModeProvider,
  TelemetryProvider,
} from '@canvas/nexio-shared/services';
import type { Command } from '@canvas/std';
import type { BlockModel } from '@canvas/store';

import { LatexBlockComponent } from './latex-block.js';

export const insertLatexBlockCommand: Command<
  {
    latex?: string;
    place?: 'after' | 'before';
    removeEmptyLine?: boolean;
    selectedModels?: BlockModel[];
  },
  {
    insertedLatexBlockId: Promise<string>;
  }
> = (ctx, next) => {
  const { selectedModels, latex, place, removeEmptyLine, std } = ctx;
  if (!selectedModels?.length) return;

  const targetModel =
    place === 'before'
      ? selectedModels[0]
      : selectedModels[selectedModels.length - 1];

  const latexBlockProps: Partial<LatexProps> & {
    flavour: 'nexio:latex';
  } = {
    flavour: 'nexio:latex',
    latex: latex ?? '',
  };

  const result = std.store.addSiblingBlocks(
    targetModel,
    [latexBlockProps],
    place
  );
  if (result.length === 0) return;

  if (removeEmptyLine && targetModel.text?.length === 0) {
    std.store.deleteBlock(targetModel);
  }

  next({
    insertedLatexBlockId: std.host.updateComplete.then(async () => {
      if (!latex) {
        const blockComponent = std.view.getBlock(result[0]);
        if (blockComponent instanceof LatexBlockComponent) {
          await blockComponent.updateComplete;
          blockComponent.toggleEditor();

          const mode = std.get(DocModeProvider).getEditorMode() ?? 'page';
          const ifEdgelessText = blockComponent.closest('nexio-edgeless-text');
          std.getOptional(TelemetryProvider)?.track('Latex', {
            from:
              mode === 'page'
                ? 'doc'
                : ifEdgelessText
                  ? 'edgeless text'
                  : 'edgeless note',
            page: mode === 'page' ? 'doc' : 'edgeless',
            segment: mode === 'page' ? 'doc' : 'whiteboard',
            module: 'equation',
            control: 'create equation',
          });
        }
      }
      return result[0];
    }),
  });
};
