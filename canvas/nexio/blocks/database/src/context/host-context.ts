import { createIdentifier } from '@canvas/global/di';
import type { EditorHost } from '@canvas/std';

export const EditorHostKey = createIdentifier<EditorHost>('editor-host');
