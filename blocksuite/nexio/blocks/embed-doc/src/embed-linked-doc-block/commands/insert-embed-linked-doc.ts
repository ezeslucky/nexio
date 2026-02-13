import { insertEmbedCard } from '@blocksuite/nexio-block-embed';
import type { EmbedCardStyle, ReferenceParams } from '@blocksuite/nexio-model';
import type { Command } from '@blocksuite/std';

export type LinkableFlavour =
  | 'nexio:bookmark'
  | 'nexio:embed-linked-doc'
  | 'nexio:embed-synced-doc'
  | 'nexio:embed-iframe'
  | 'nexio:embed-figma'
  | 'nexio:embed-github'
  | 'nexio:embed-loom'
  | 'nexio:embed-youtube';

export type InsertedLinkType = {
  flavour: LinkableFlavour;
} | null;

export const insertEmbedLinkedDocCommand: Command<
  {
    docId: string;
    params?: ReferenceParams;
  },
  { blockId: string }
> = (ctx, next) => {
  const { docId, params, std } = ctx;
  const flavour = 'nexio:embed-linked-doc';
  const targetStyle: EmbedCardStyle = 'vertical';
  const props: Record<string, unknown> = { pageId: docId };
  if (params) props.params = params;
  const blockId = insertEmbedCard(std, { flavour, targetStyle, props });
  if (!blockId) return;
  next({ blockId });
};
