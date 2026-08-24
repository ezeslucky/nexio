import type { CodeBlockModel } from '@canvas/nexio-model';
import { createIdentifier } from '@canvas/global/di';
import type { ExtensionType } from '@canvas/store';
import type { HTMLTemplateResult } from 'lit';

export type CodeBlockPreviewRenderer = (
  model: CodeBlockModel
) => HTMLTemplateResult | null;

export type CodeBlockPreviewContext = {
  renderer: CodeBlockPreviewRenderer;
  lang: string;
};

export const CodeBlockPreviewIdentifier =
  createIdentifier<CodeBlockPreviewContext>('CodeBlockPreview');

export function CodeBlockPreviewExtension(
  lang: string,
  renderer: CodeBlockPreviewRenderer
): ExtensionType {
  return {
    setup: di => {
      di.addImpl(CodeBlockPreviewIdentifier(lang), { renderer, lang });
    },
  };
}
