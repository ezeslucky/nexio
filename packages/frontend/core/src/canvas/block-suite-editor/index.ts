import { registerAIEffects } from '@nexio/core/canvas/ai/effects';
import { editorEffects } from '@nexio/core/canvas/editors';

import { registerTemplates } from './register-templates';

editorEffects();
registerAIEffects();
registerTemplates();

export * from './canvas-editor';
