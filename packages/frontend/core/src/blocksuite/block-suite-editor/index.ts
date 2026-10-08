import { registerAIEditorEffects } from '@nexio/core/blocksuite/ai/effects/editor';
import { editorEffects } from '@nexio/core/blocksuite/editors';

import { registerTemplates } from './register-templates';

editorEffects();
registerAIEditorEffects();
registerTemplates();

export * from './blocksuite-editor';
