import type { ExtensionType } from '@canvas/nexio/store';
import type { MarkdownAST } from '@canvas/nexio-shared/adapters';
import {
  createIdentifier,
  type ServiceIdentifier,
} from '@canvas/global/di';

import type { ElementModelMatcher } from '../../type.js';

export type ElementToMarkdownAdapterMatcher = ElementModelMatcher<MarkdownAST>;

export const ElementToMarkdownAdapterMatcherIdentifier =
  createIdentifier<ElementToMarkdownAdapterMatcher>(
    'elementToMarkdownAdapterMatcher'
  );

export function ElementToMarkdownAdapterExtension(
  matcher: ElementToMarkdownAdapterMatcher
): ExtensionType & {
  identifier: ServiceIdentifier<ElementToMarkdownAdapterMatcher>;
} {
  const identifier = ElementToMarkdownAdapterMatcherIdentifier(matcher.name);
  return {
    setup: di => {
      di.addImpl(identifier, () => matcher);
    },
    identifier,
  };
}
