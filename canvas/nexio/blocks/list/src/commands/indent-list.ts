import { ListBlockModel, ParagraphBlockModel } from '@canvas/nexio-model';
import type { IndentContext } from '@canvas/nexio-shared/types';
import {
  getNearestHeadingBefore,
  matchModels,
} from '@canvas/nexio-shared/utils';
import { type Command, TextSelection } from '@canvas/std';

import { correctNumberedListsOrderToPrev } from './utils.js';

export const canIndentListCommand: Command<
  Partial<Omit<IndentContext, 'type' | 'flavour'>>,
  {
    indentContext: IndentContext;
  }
> = (ctx, next) => {
  let { blockId, inlineIndex } = ctx;
  const { std } = ctx;
  const { selection, store } = std;
  if (!blockId) {
    const text = selection.find(TextSelection);
    
    if (!text || (text.to && text.from.blockId !== text.to.blockId)) {
      return;
    }

    blockId = text.from.blockId;
    inlineIndex = text.from.index;
  }
  if (blockId == null || inlineIndex == null) {
    return;
  }

  const model = store.getBlock(blockId)?.model;
  if (!model || !matchModels(model, [ListBlockModel])) {
    return;
  }
  const schema = std.store.schema;
  /**
   * aaa
   */
  const previousSibling = store.getPrev(model);
  if (
    store.readonly ||
    !previousSibling ||
    !schema.isValid(model.flavour, previousSibling.flavour)
  ) {
    // cannot indent, do nothing
    return;
  }
  /**
   * eee
   */
  // const nextSibling = store.getNext(model);

  return next({
    indentContext: {
      blockId,
      inlineIndex,
      type: 'indent',
      flavour: 'nexio:list',
    },
  });
};

export const indentListCommand: Command<{
  indentContext: IndentContext;
}> = (ctx, next) => {
  const { indentContext, std } = ctx;
  if (
    !indentContext ||
    indentContext.type !== 'indent' ||
    indentContext.flavour !== 'nexio:list'
  ) {
    console.warn(
      'you need to use `canIndentList` command before running `indentList` command'
    );
    return;
  }

  const { blockId } = indentContext;
  const { store, selection, host, range } = std;

  const model = store.getBlock(blockId)?.model;
  if (!model) return;

  const previousSibling = store.getPrev(model);
  if (!previousSibling) return;

  const nextSibling = store.getNext(model);

  store.captureSync();

  store.moveBlocks([model], previousSibling);
  correctNumberedListsOrderToPrev(store, model);
  if (nextSibling) correctNumberedListsOrderToPrev(store, nextSibling);

  // 123
  //   > # 456
  // 789
  //
  // we need to update 456 collapsed state to false when indent 789
  const nearestHeading = getNearestHeadingBefore(model);
  if (
    nearestHeading &&
    matchModels(nearestHeading, [ParagraphBlockModel]) &&
    nearestHeading.props.collapsed
  ) {
    store.updateBlock(nearestHeading, {
      collapsed: false,
    });
  }

  const textSelection = selection.find(TextSelection);
  if (textSelection) {
    host.updateComplete
      .then(() => {
        range.syncTextSelectionToRange(textSelection);
      })
      .catch(console.error);
  }

  return next();
};
