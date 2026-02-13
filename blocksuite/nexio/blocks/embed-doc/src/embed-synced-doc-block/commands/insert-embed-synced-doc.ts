import { insertEmbedCard } from '@blocksuite/nexio-block-embed';
import type { EmbedCardStyle, ReferenceParams } from '@blocksuite/nexio-model';
import type { Command } from '@blocksuite/std';

export const insertEmbedSyncedDocCommand: Command<
  {
    docId: string;
    params?: ReferenceParams;
  },
  { blockId: string }
> = (ctx, next) => {
  const { docId, params, std } = ctx;
  const flavour = 'nexio:embed-synced-doc';
  const targetStyle: EmbedCardStyle = 'syncedDoc';
  const props: Record<string, unknown> = { pageId: docId };
  if (params) props.params = params;
  const blockId = insertEmbedCard(std, { flavour, targetStyle, props });
  if (!blockId) return;
  next({ blockId });
};
