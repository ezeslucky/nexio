import {
  type StoreExtensionContext,
  StoreExtensionProvider,
} from '@canvas/nexio-ext-loader';
import { CodeBlockSchemaExtension } from '@canvas/nexio-model';

import { CodeBlockAdapterExtensions } from './adapters/extension';
import { CodeMarkdownPreprocessorExtension } from './adapters/markdown/preprocessor';

export class CodeStoreExtension extends StoreExtensionProvider {
  override name = 'nexio-code-block';

  override setup(context: StoreExtensionContext) {
    super.setup(context);
    context.register(CodeBlockSchemaExtension);
    context.register(CodeBlockAdapterExtensions);
    context.register(CodeMarkdownPreprocessorExtension);
  }
}
