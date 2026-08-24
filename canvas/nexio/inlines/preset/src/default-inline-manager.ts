import { CommentInlineSpecExtension } from '@canvas/nexio-inline-comment';
import { FootNoteInlineSpecExtension } from '@canvas/nexio-inline-footnote';
import { LatexInlineSpecExtension } from '@canvas/nexio-inline-latex';
import { LinkInlineSpecExtension } from '@canvas/nexio-inline-link';
import { MentionInlineSpecExtension } from '@canvas/nexio-inline-mention';
import { ReferenceInlineSpecExtension } from '@canvas/nexio-inline-reference';
import type { NexioTextAttributes } from '@canvas/nexio-shared/types';
import { InlineManagerExtension } from '@canvas/std/inline';

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
