import { ReferenceInfoSchema } from '@canvas/nexio-model';
import type { NexioTextAttributes } from '@canvas/nexio-shared/types';
import { StdIdentifier } from '@canvas/std';
import { InlineSpecExtension } from '@canvas/std/inline';
import { html } from 'lit';
import { z } from 'zod';

import {
  ReferenceNodeConfigExtension,
  ReferenceNodeConfigProvider,
} from './reference-node/reference-config';

export const ReferenceInlineSpecExtension =
  InlineSpecExtension<NexioTextAttributes>('reference', provider => {
    const std = provider.get(StdIdentifier);
    const configProvider = new ReferenceNodeConfigProvider(std);
    const config =
      provider.getOptional(ReferenceNodeConfigExtension.identifier) ?? {};
    if (config.customContent) {
      configProvider.setCustomContent(config.customContent);
    }
    if (config.interactable !== undefined) {
      configProvider.setInteractable(config.interactable);
    }
    if (config.hidePopup !== undefined) {
      configProvider.setHidePopup(config.hidePopup);
    }
    return {
      name: 'reference',
      schema: z.object({
        reference: z
          .object({
            type: z.enum([
              // @deprecated Subpage is deprecated, use LinkedPage instead
              'Subpage',
              'LinkedPage',
            ]),
          })
          .merge(ReferenceInfoSchema)
          .optional()
          .nullable()
          .catch(undefined),
      }),
      match: delta => {
        return !!delta.attributes?.reference;
      },
      renderer: ({ delta, selected }) => {
        return html`<nexio-reference
          .std=${std}
          .delta=${delta}
          .selected=${selected}
          .config=${configProvider}
        ></nexio-reference>`;
      },
      embed: true,
    };
  });
