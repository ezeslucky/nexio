import {
  renderMermaidSvgBackend,
  renderTypstSvgBackend,
} from '@nexio/core/modules/code-block-preview-renderer/platform-backend';
import type {
  MermaidRenderRequest,
  MermaidRenderResult,
} from '@nexio/core/modules/mermaid/renderer';
import type {
  TypstRenderRequest,
  TypstRenderResult,
} from '@nexio/core/modules/typst/renderer';
import { sanitizeSvg as sanitizeSvgDocument } from '@blocksuite/affine-shared/utils';

export function sanitizeSvg(svg: string): string {
  return sanitizeSvgDocument(svg);
}

export async function renderMermaidSvg(
  request: MermaidRenderRequest
): Promise<MermaidRenderResult> {
  const rendered = await renderMermaidSvgBackend(request);

  const sanitizedSvg = sanitizeSvg(rendered.svg);
  if (!sanitizedSvg) {
    throw new Error('Preview renderer returned invalid SVG.');
  }
  return { svg: sanitizedSvg };
}

export async function renderTypstSvg(
  request: TypstRenderRequest
): Promise<TypstRenderResult> {
  const rendered = await renderTypstSvgBackend(request);

  const sanitizedSvg = sanitizeSvgDocument(rendered.svg);
  if (!sanitizedSvg) {
    throw new Error('Preview renderer returned invalid SVG.');
  }
  return { svg: sanitizedSvg };
}
