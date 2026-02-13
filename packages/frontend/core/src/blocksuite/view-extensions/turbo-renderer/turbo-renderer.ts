import { getWorkerUrl } from '@nexio/env/worker';
import { CodeLayoutHandlerExtension } from '@blocksuite/nexio/blocks/code';
import { ImageLayoutHandlerExtension } from '@blocksuite/nexio/blocks/image';
import { ListLayoutHandlerExtension } from '@blocksuite/nexio/blocks/list';
import { NoteLayoutHandlerExtension } from '@blocksuite/nexio/blocks/note';
import { ParagraphLayoutHandlerExtension } from '@blocksuite/nexio/blocks/paragraph';
import {
  TurboRendererConfigFactory,
  ViewportTurboRendererExtension,
} from '@blocksuite/nexio/gfx/turbo-renderer';

function createPainterWorker() {
  const worker = new Worker(getWorkerUrl('turbo-painter'));
  return worker;
}

export const turboRendererExtension = [
  ParagraphLayoutHandlerExtension,
  ListLayoutHandlerExtension,
  NoteLayoutHandlerExtension,
  CodeLayoutHandlerExtension,
  ImageLayoutHandlerExtension,
  TurboRendererConfigFactory({
    options: {
      zoomThreshold: 1,
      debounceTime: 1000,
    },
    painterWorkerEntry: createPainterWorker,
  }),
  ViewportTurboRendererExtension,
];
