import { ImageLayoutHandlerExtension } from '@canvas/nexio/blocks/image';
import { ListLayoutHandlerExtension } from '@canvas/nexio/blocks/list';
import { ParagraphLayoutHandlerExtension } from '@canvas/nexio/blocks/paragraph';
import {
  TurboRendererConfigFactory,
  ViewportTurboRendererExtension,
  ViewportTurboRendererIdentifier,
} from '@canvas/nexio/gfx/turbo-renderer';

import { addSampleNotes } from './doc-generator.js';
import { createPainterWorker, setupEditor } from './setup.js';

async function init() {
  await setupEditor('edgeless', [
    ParagraphLayoutHandlerExtension,
    ListLayoutHandlerExtension,
    ImageLayoutHandlerExtension,
    TurboRendererConfigFactory({
      painterWorkerEntry: createPainterWorker,
    }),
    ViewportTurboRendererExtension,
  ]);
  addSampleNotes(doc, 100);
  doc.load();

  const renderer = editor.std.get(
    ViewportTurboRendererIdentifier
  ) as ViewportTurboRendererExtension;
  window.renderer = renderer;
}

await init();
