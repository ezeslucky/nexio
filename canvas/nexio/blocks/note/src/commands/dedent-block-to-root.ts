import { NoteBlockModel } from '@canvas/nexio-model';
import { matchModels } from '@canvas/nexio-shared/utils';
import type { Command } from '@canvas/std';

import { dedentBlock } from './dedent-block';

export const dedentBlockToRoot: Command<{
  blockId?: string;
  stopCapture?: boolean;
}> = (ctx, next) => {
  let { blockId } = ctx;
  const { std, stopCapture = true } = ctx;
  const { store } = std;
  if (!blockId) {
    const sel = std.selection.getGroup('note').at(0);
    blockId = sel?.blockId;
  }
  if (!blockId) return;
  const model = std.store.getBlock(blockId)?.model;
  if (!model) return;

  let parent = store.getParent(model);
  let changed = false;
  while (parent && !matchModels(parent, [NoteBlockModel])) {
    if (!changed) {
      if (stopCapture) store.captureSync();
      changed = true;
    }
    std.command.exec(dedentBlock, { blockId: model.id, stopCapture: true });
    parent = store.getParent(model);
  }

  if (!changed) {
    return;
  }

  return next();
};
