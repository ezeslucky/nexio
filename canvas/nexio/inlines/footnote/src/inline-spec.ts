import { FootNoteSchema } from '@canvas/nexio-model';
import type { NexioTextAttributes } from '@canvas/nexio-shared/types';
import { StdIdentifier } from '@canvas/std';
import { InlineSpecExtension } from '@canvas/std/inline';
import { html } from 'lit';
import z from 'zod';

import { FootNoteNodeConfigIdentifier } from './footnote-node/footnote-config';

export const FootNoteInlineSpecExtension =
  InlineSpecExtension<NexioTextAttributes>('footnote', provider => {
    const std = provider.get(StdIdentifier);
    const config =
      provider.getOptional(FootNoteNodeConfigIdentifier) ?? undefined;
    return {
      name: 'footnote',
      schema: z.object({
        footnote: FootNoteSchema.optional().nullable().catch(undefined),
      }),
      match: delta => {
        return !!delta.attributes?.footnote;
      },
      renderer: ({ delta }) => {
        return html`<nexio-footnote-node
          .delta=${delta}
          .std=${std}
          .config=${config}
        ></nexio-footnote-node>`;
      },
      embed: true,
    };
  });
