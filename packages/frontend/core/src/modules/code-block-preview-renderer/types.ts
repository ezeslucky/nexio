import type {
  MermaidRenderRequest,
  MermaidRenderResult,
} from '@nexio/core/modules/mermaid/renderer';
import type {
  TypstRenderRequest,
  TypstRenderResult,
} from '@nexio/core/modules/typst/renderer';

export type PreviewRenderRequestMap = {
  mermaid: MermaidRenderRequest;
  typst: TypstRenderRequest;
};

export type PreviewRenderResultMap = {
  mermaid: MermaidRenderResult;
  typst: TypstRenderResult;
};
