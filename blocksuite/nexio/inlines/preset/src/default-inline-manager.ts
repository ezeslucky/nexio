import { CommentInlineSpecExtension } from '@blocksuite/nexio-inline-comment';
import { FootNoteInlineSpecExtension } from '@blocksuite/nexio-inline-footnote';
import { LatexInlineSpecExtension } from '@blocksuite/nexio-inline-latex';
import { LinkInlineSpecExtension } from '@blocksuite/nexio-inline-link';
import { MentionInlineSpecExtension } from '@blocksuite/nexio-inline-mention';
import { ReferenceInlineSpecExtension } from '@blocksuite/nexio-inline-reference';
import type { NexioTextAttributes } from '@blocksuite/nexio-shared/types';
import { InlineManagerExtension } from '@blocksuite/std/inline';

import {
  BackgroundInlineSpecExtension,
  BoldInlineSpecExtension,
  CodeInlineSpecExtension,
  ColorInlineSpecExtension,
  ItalicInlineSpecExtension,
  StrikeInlineSpecExtension,
  UnderlineInlineSpecExtension,
} from './inline-spec';

export const DefaultInlineManagerExtension =
  InlineManagerExtension<NexioTextAttributes>({
    id: 'DefaultInlineManager',
    specs: [
      BoldInlineSpecExtension.identifier,
      ItalicInlineSpecExtension.identifier,
      UnderlineInlineSpecExtension.identifier,
      StrikeInlineSpecExtension.identifier,
      CodeInlineSpecExtension.identifier,
      BackgroundInlineSpecExtension.identifier,
      ColorInlineSpecExtension.identifier,
      LatexInlineSpecExtension.identifier,
      ReferenceInlineSpecExtension.identifier,
      LinkInlineSpecExtension.identifier,
      FootNoteInlineSpecExtension.identifier,
      MentionInlineSpecExtension.identifier,
      CommentInlineSpecExtension.identifier,
    ],
  });
