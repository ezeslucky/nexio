import { registerAIEffects } from '@nexio/core/blocksuite/ai/effects';
import { editorEffects } from '@nexio/core/blocksuite/editors';

import { registerTemplates } from './register-templates';

editorEffects();
registerAIEffects();
registerTemplates();

export * from './blocksuite-editor';
