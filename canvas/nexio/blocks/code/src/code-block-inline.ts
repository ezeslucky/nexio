import { CommentInlineSpecExtension } from '@canvas/nexio-inline-comment';
import { LatexInlineSpecExtension } from '@canvas/nexio-inline-latex';
import { LinkInlineSpecExtension } from '@canvas/nexio-inline-link';
import {
  BackgroundInlineSpecExtension,
  BoldInlineSpecExtension,
  CodeInlineSpecExtension,
  ColorInlineSpecExtension,
  ItalicInlineSpecExtension,
  StrikeInlineSpecExtension,
  UnderlineInlineSpecExtension,
} from '@canvas/nexio-inline-preset';
import type { NexioTextAttributes } from '@canvas/nexio-shared/types';
import {
  InlineManagerExtension,
  InlineSpecExtension,
} from '@canvas/std/inline';
import { html } from 'lit';
import { z } from 'zod';

export const CodeBlockUnitSpecExtension =
  InlineSpecExtension<NexioTextAttributes>({
    name: 'code-block-unit',
    schema: z.object({
      'code-block-uint': z.undefined(),
    }),
    match: () => true,
    renderer: ({ delta }) => {
      return html`<nexio-code-unit .delta=${delta}></nexio-code-unit>`;
    },
  });

export const CodeBlockInlineManagerExtension =
  InlineManagerExtension<NexioTextAttributes>({
    id: 'CodeBlockInlineManager',
    enableMarkdown: false,
    specs: [
      BoldInlineSpecExtension.identifier,
      ItalicInlineSpecExtension.identifier,
      UnderlineInlineSpecExtension.identifier,
      StrikeInlineSpecExtension.identifier,
      CodeInlineSpecExtension.identifier,
      BackgroundInlineSpecExtension.identifier,
      ColorInlineSpecExtension.identifier,
      LatexInlineSpecExtension.identifier,
      LinkInlineSpecExtension.identifier,
      CodeBlockUnitSpecExtension.identifier,
      CommentInlineSpecExtension.identifier,
    ],
  });
