import './page-detail-editor.css';

import { useLiveData, useService } from '@ezeslucky/infra';
import clsx from 'clsx';
import { useEffect } from 'react';

import type { NexioEditorContainer } from '../canvas/block-suite-editor';
import { CanvasEditor } from '../canvas/block-suite-editor';
import { DocService } from '../modules/doc';
import { EditorService } from '../modules/editor';
import { EditorSettingService } from '../modules/editor-setting';
import * as styles from './page-detail-editor.css';

declare global {
  // oxlint-disable-next-line no-var
  var currentEditor: NexioEditorContainer | undefined;
}

export type OnLoadEditor = (
  editor: NexioEditorContainer
) => (() => void) | void;

export interface PageDetailEditorProps {
  onLoad?: OnLoadEditor;
  readonly?: boolean;
}

export const PageDetailEditor = ({
  onLoad,
  readonly,
}: PageDetailEditorProps) => {
  const editor = useService(EditorService).editor;
  const mode = useLiveData(editor.mode$);
  const defaultOpenProperty = useLiveData(editor.defaultOpenProperty$);

  const doc = useService(DocService).doc;
  const pageWidth = useLiveData(doc.properties$.selector(p => p.pageWidth));

  const isSharedMode = editor.isSharedMode;
  const editorSetting = useService(EditorSettingService).editorSetting;
  const settings = useLiveData(
    editorSetting.settings$.selector(s => ({
      fontFamily: s.fontFamily,
      customFontFamily: s.customFontFamily,
      fullWidthLayout: s.fullWidthLayout,
    }))
  );
  const fullWidthLayout = pageWidth
    ? pageWidth === 'fullWidth'
    : settings.fullWidthLayout;

  useEffect(() => {
    editor.doc.canvasDoc.readonly = readonly ?? false;
  }, [editor, readonly]);

  return (
    <CanvasEditor
      className={clsx(styles.editor, {
        'full-screen': !isSharedMode && fullWidthLayout,
        'is-public': isSharedMode,
      })}
      mode={mode}
      defaultOpenProperty={defaultOpenProperty}
      page={editor.doc.canvasDoc}
      shared={isSharedMode}
      readonly={readonly}
      onEditorReady={onLoad}
    />
  );
};
