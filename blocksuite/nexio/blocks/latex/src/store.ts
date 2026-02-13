import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@blocksuite/nexio-ext-loader';
import { LatexBlockSchemaExtension } from '@blocksuite/nexio-model';

import { LatexBlockAdapterExtensions } from './adapters/extension';
import { LatexMarkdownPreprocessorExtension } from './adapters/markdown/preprocessor';

export class LatexStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-latex-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register([LatexBlockSchemaExtension]);
    context.register(LatexBlockAdapterExtensions);
    context.register(LatexMarkdownPreprocessorExtension);
  }
}
