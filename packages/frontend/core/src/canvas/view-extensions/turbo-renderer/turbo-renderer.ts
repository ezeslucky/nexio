import { getWorkerUrl } from '@nexio/env/worker';
import { CodeLayoutHandlerExtension } from '@canvas/nexio/blocks/code';
import { ImageLayoutHandlerExtension } from '@canvas/nexio/blocks/image';
import { ListLayoutHandlerExtension } from '@canvas/nexio/blocks/list';
import { NoteLayoutHandlerExtension } from '@canvas/nexio/blocks/note';
import { ParagraphLayoutHandlerExtension } from '@canvas/nexio/blocks/paragraph';
import {
  TurboRendererConfigFactory,
  ViewportTurboRendererExtension,
} from '@canvas/nexio/gfx/turbo-renderer';

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
