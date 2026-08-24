import type { ReferenceParams } from '@canvas/nexio-model';
import { createIdentifier } from '@canvas/global/di';
import type { ExtensionType } from '@canvas/store';

export interface ParseDocUrlService {
  parseDocUrl: (
    url: string
  ) => ({ docId: string } & ReferenceParams) | undefined;
}

export const ParseDocUrlProvider =
  createIdentifier<ParseDocUrlService>('ParseDocUrlService');

export function ParseDocUrlExtension(
  parseDocUrlService: ParseDocUrlService
): ExtensionType {
  return {
    setup: di => {
      di.addImpl(ParseDocUrlProvider, parseDocUrlService);
    },
  };
}
