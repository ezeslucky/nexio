import type { NexioTextAttributes } from '@canvas/nexio-shared/types';
import { StdIdentifier } from '@canvas/std';
import { InlineSpecExtension } from '@canvas/std/inline';
import { html } from 'lit';
import { z } from 'zod';

export const LinkInlineSpecExtension =
  InlineSpecExtension<NexioTextAttributes>('link', provider => {
    const std = provider.get(StdIdentifier);
    return {
      name: 'link',
      schema: z.object({
        link: z.string().optional().nullable().catch(undefined),
      }),
      match: delta => {
        return !!delta.attributes?.link;
      },
      renderer: ({ delta }) => {
        return html`<nexio-link .std=${std} .delta=${delta}></nexio-link>`;
      },
    };
  });
