import {
  createIdentifier,
  type ServiceIdentifier,
} from '@canvas/global/di';
import type { ExtensionType } from '@canvas/store';

import type { BlockAdapterMatcher, TextBuffer } from '../types/adapter.js';

export type BlockPlainTextAdapterMatcher = BlockAdapterMatcher<TextBuffer>;

export const BlockPlainTextAdapterMatcherIdentifier =
  createIdentifier<BlockPlainTextAdapterMatcher>(
    'BlockPlainTextAdapterMatcher'
  );

export function BlockPlainTextAdapterExtension(
  matcher: BlockPlainTextAdapterMatcher
): ExtensionType & {
  identifier: ServiceIdentifier<BlockPlainTextAdapterMatcher>;
} {
  const identifier = BlockPlainTextAdapterMatcherIdentifier(matcher.flavour);
  return {
    setup: di => {
      di.addImpl(identifier, () => matcher);
    },
    identifier,
  };
}
