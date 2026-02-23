import { Service } from '@ezeslucky/infra';

import { Editor } from '../entities/editor';
import { EditorInitialized } from '../events';

export class EditorsService extends Service {
  createEditor() {
    const editor = this.framework.createEntity(Editor);
    editor.scope.emitEvent(EditorInitialized, editor);
    return editor;
  }
}
