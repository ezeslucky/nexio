import type { OpSchema } from '@ezeslucky/infra/op';

import type { PDFMeta, RenderedPage, RenderPageOpts } from './types';

export interface ClientOps extends OpSchema {
  open: [{ data: ArrayBuffer }, PDFMeta];
  render: [RenderPageOpts, RenderedPage];
}
