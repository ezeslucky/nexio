// Import models only, the bundled file should not include anything else.
import { DataViewBlockSchema } from '@canvas/nexio-block-data-view';
import { SurfaceBlockSchema } from '@canvas/nexio-block-surface';
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
} from '@canvas/nexio-model';
import type { BlockSchema } from '@canvas/store';
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
