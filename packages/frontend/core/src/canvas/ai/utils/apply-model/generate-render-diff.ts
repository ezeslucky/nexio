import { type Block, diffMarkdown } from './markdown-diff';

export interface RenderDiffs {
  deletes: string[];
  inserts: Record<string, Block[]>;
  updates: Record<string, string>;
}


export function generateRenderDiff(
  originalMarkdown: string,
  changedMarkdown: string
) {
  const { patches } = diffMarkdown(originalMarkdown, changedMarkdown);

  const diffMap: RenderDiffs = {
    deletes: [],
    inserts: {},
    updates: {},
  };

  const insertGroups: Record<string, Block[]> = {};
  let lastInsertKey: string | null = null;
  let lastInsertIndex: number | null = null;

  for (const patch of patches) {
    switch (patch.op) {
      case 'delete':
        diffMap.deletes.push(patch.id);
        break;
      case 'insert': {
        const prevBlockId = patch.after;
        if (
          lastInsertKey !== null &&
          lastInsertIndex !== null &&
          patch.index === lastInsertIndex + 1
        ) {
          insertGroups[lastInsertKey].push(patch.block);
        } else {
          insertGroups[prevBlockId] = [patch.block];
          lastInsertKey = prevBlockId;
        }
        lastInsertIndex = patch.index;
        break;
      }
      case 'replace':
        diffMap.updates[patch.id] = patch.content;
        break;
    }
  }

  diffMap.inserts = insertGroups;

  return diffMap;
}
