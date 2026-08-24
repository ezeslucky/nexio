import type { Command } from '@canvas/std';
import type { BlockModel } from '@canvas/store';

export const retainFirstModelCommand: Command<{
  selectedModels?: BlockModel[];
}> = (ctx, next) => {
  if (!ctx.selectedModels) {
    console.error(
      '`selectedModels` is required, you need to use `getSelectedModels` command before adding this command to the pipeline.'
    );
    return;
  }

  if (ctx.selectedModels.length > 0) {
    ctx.selectedModels.shift();
  }

  return next();
};
