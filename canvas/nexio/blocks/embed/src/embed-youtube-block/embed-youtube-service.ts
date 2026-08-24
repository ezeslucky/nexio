import {
  EmbedYoutubeBlockSchema,
  type EmbedYoutubeModel,
  EmbedYoutubeStyles,
} from '@canvas/nexio-model';
import {
  EmbedOptionConfig,
  LinkPreviewServiceIdentifier,
} from '@canvas/nexio-shared/services';
import { BlockService } from '@canvas/std';

import { youtubeUrlRegex } from './embed-youtube-model.js';
import { queryEmbedYoutubeData } from './utils.js';

export class EmbedYoutubeBlockService extends BlockService {
  static override readonly flavour = EmbedYoutubeBlockSchema.model.flavour;

  queryUrlData = (
    embedYoutubeModel: EmbedYoutubeModel,
    signal?: AbortSignal
  ) => {
    return queryEmbedYoutubeData(
      embedYoutubeModel,
      this.std.get(LinkPreviewServiceIdentifier),
      signal
    );
  };
}

export const EmbedYoutubeBlockOptionConfig = EmbedOptionConfig({
  flavour: EmbedYoutubeBlockSchema.model.flavour,
  urlRegex: youtubeUrlRegex,
  styles: EmbedYoutubeStyles,
  viewType: 'embed',
});
