import type { InlineHtmlAST } from '@canvas/nexio-shared/adapters';
import { InlineDeltaToHtmlAdapterExtension } from '@canvas/nexio-shared/adapters';

export const linkDeltaToHtmlAdapterMatcher = InlineDeltaToHtmlAdapterExtension({
  name: 'link',
  match: delta => !!delta.attributes?.link,
  toAST: (delta, _) => {
    const hast: InlineHtmlAST = {
      type: 'text',
      value: delta.insert,
    };
    const link = delta.attributes?.link;
    if (!link) {
      return hast;
    }
    return {
      type: 'element',
      tagName: 'a',
      properties: {
        href: link,
      },
      children: [hast],
    };
  },
});
