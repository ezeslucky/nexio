import { EmbedFigmaBlockSchema } from '@canvas/nexio-model';

import { createEmbedEdgelessBlockInteraction } from '../common/embed-block-element.js';
import { toEdgelessEmbedBlock } from '../common/to-edgeless-embed-block.js';
import { EmbedFigmaBlockComponent } from './embed-figma-block.js';

export class EmbedEdgelessBlockComponent extends toEdgelessEmbedBlock(
  EmbedFigmaBlockComponent
) {}

export const EmbedFigmaBlockInteraction = createEmbedEdgelessBlockInteraction(
  EmbedFigmaBlockSchema.model.flavour
);
