import { CanvasHeaderTitle } from '@nexio/core/canvas/block-suite-header/title';
import { EditorModeSwitch } from '@nexio/core/canvas/block-suite-mode-switch';
import ShareHeaderRightItem from '@nexio/core/components/cloud/share-header-right-item';
import type { DocMode } from '@canvas/nexio/model';

import * as styles from './share-header.css';

export function ShareHeader({
  publishMode,
  isTemplate,
  templateName,
  snapshotUrl,
}: {
  pageId: string;
  publishMode: DocMode;
  isTemplate?: boolean;
  templateName?: string;
  snapshotUrl?: string;
}) {
  return (
    <div className={styles.header}>
      <EditorModeSwitch />
      <CanvasHeaderTitle />
      <div className={styles.spacer} />
      <ShareHeaderRightItem
        publishMode={publishMode}
        isTemplate={isTemplate}
        snapshotUrl={snapshotUrl}
        templateName={templateName}
      />
    </div>
  );
}
