import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@canvas/nexio-ext-loader';
import {
  EmbedFigmaBlockSchemaExtension,
  EmbedGithubBlockSchemaExtension,
  EmbedHtmlBlockSchemaExtension,
  EmbedIframeBlockSchemaExtension,
  EmbedLinkedDocBlockSchemaExtension,
  EmbedLoomBlockSchemaExtension,
  EmbedSyncedDocBlockSchemaExtension,
  EmbedYoutubeBlockSchemaExtension,
} from '@canvas/nexio-model';
import { EmbedIframeService } from '@canvas/nexio-shared/services';

import { EmbedFigmaBlockAdapterExtensions } from './embed-figma-block/adapters/extension';
import { EmbedGithubBlockAdapterExtensions } from './embed-github-block/adapters/extension';
import { EmbedIframeConfigExtensions } from './embed-iframe-block';
import { EmbedIframeBlockAdapterExtensions } from './embed-iframe-block/adapters';
import { EmbedLoomBlockAdapterExtensions } from './embed-loom-block/adapters/extension';
import { EmbedYoutubeBlockAdapterExtensions } from './embed-youtube-block/adapters/extension';

export class EmbedStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-embed-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register([
      EmbedSyncedDocBlockSchemaExtension,
      EmbedLinkedDocBlockSchemaExtension,
      EmbedHtmlBlockSchemaExtension,
      EmbedIframeBlockSchemaExtension,
      EmbedGithubBlockSchemaExtension,
      EmbedFigmaBlockSchemaExtension,
      EmbedLoomBlockSchemaExtension,
      EmbedYoutubeBlockSchemaExtension,
    ]);
    context.register(EmbedFigmaBlockAdapterExtensions);
    context.register(EmbedGithubBlockAdapterExtensions);
    context.register(EmbedYoutubeBlockAdapterExtensions);
    context.register(EmbedLoomBlockAdapterExtensions);
    context.register(EmbedIframeBlockAdapterExtensions);

    context.register(EmbedIframeConfigExtensions);
    context.register(EmbedIframeService);
  }
}
