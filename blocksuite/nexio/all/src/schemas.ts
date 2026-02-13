// Import models only, the bundled file should not include anything else.
import { DataViewBlockSchema } from '@blocksuite/nexio-block-data-view';
import { SurfaceBlockSchema } from '@blocksuite/nexio-block-surface';
import {
  AttachmentBlockSchema,
  BookmarkBlockSchema,
  CalloutBlockSchema,
  CodeBlockSchema,
  DatabaseBlockSchema,
  DividerBlockSchema,
  EdgelessTextBlockSchema,
  EmbedFigmaBlockSchema,
  EmbedGithubBlockSchema,
  EmbedHtmlBlockSchema,
  EmbedLinkedDocBlockSchema,
  EmbedLoomBlockSchema,
  EmbedSyncedDocBlockSchema,
  EmbedYoutubeBlockSchema,
  FrameBlockSchema,
  ImageBlockSchema,
  LatexBlockSchema,
  ListBlockSchema,
  NoteBlockSchema,
  ParagraphBlockSchema,
  RootBlockSchema,
  SurfaceRefBlockSchema,
  TableBlockSchema,
} from '@blocksuite/nexio-model';
import type { BlockSchema } from '@blocksuite/store';
import type { z } from 'zod';

/** Built-in first party block models built for nexio */
export const NexioSchemas: z.infer<typeof BlockSchema>[] = [
  CodeBlockSchema,
  ParagraphBlockSchema,
  RootBlockSchema,
  ListBlockSchema,
  NoteBlockSchema,
  DividerBlockSchema,
  ImageBlockSchema,
  SurfaceBlockSchema,
  BookmarkBlockSchema,
  FrameBlockSchema,
  DatabaseBlockSchema,
  SurfaceRefBlockSchema,
  DataViewBlockSchema,
  AttachmentBlockSchema,
  EmbedYoutubeBlockSchema,
  EmbedFigmaBlockSchema,
  EmbedGithubBlockSchema,
  EmbedHtmlBlockSchema,
  EmbedLinkedDocBlockSchema,
  EmbedSyncedDocBlockSchema,
  EmbedLoomBlockSchema,
  EdgelessTextBlockSchema,
  LatexBlockSchema,
  TableBlockSchema,
  CalloutBlockSchema,
];
