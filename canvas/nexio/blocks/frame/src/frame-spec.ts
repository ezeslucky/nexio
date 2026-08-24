import { FrameBlockSchema } from '@canvas/nexio-model';
import { BlockViewExtension } from '@canvas/std';
import type { ExtensionType } from '@canvas/store';
import { literal } from 'lit/static-html.js';

import { FrameBlockInteraction } from './frame-block';
import { EdgelessFrameManager, FrameOverlay } from './frame-manager';

const flavour = FrameBlockSchema.model.flavour;

export const FrameBlockSpec: ExtensionType[] = [
  BlockViewExtension(flavour, literal`nexio-frame`),
  FrameOverlay,
  EdgelessFrameManager,
  FrameBlockInteraction,
];
