import {
  EmbedFigmaBlockSchema,
  EmbedFigmaStyles,
} from '@canvas/nexio-model';
import { EmbedOptionConfig } from '@canvas/nexio-shared/services';

import { figmaUrlRegex } from './embed-figma-model.js';

export const EmbedFigmaBlockOptionConfig = EmbedOptionConfig({
  flavour: EmbedFigmaBlockSchema.model.flavour,
  urlRegex: figmaUrlRegex,
  styles: EmbedFigmaStyles,
  viewType: 'embed',
});
