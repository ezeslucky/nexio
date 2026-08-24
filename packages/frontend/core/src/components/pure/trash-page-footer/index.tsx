import { Button } from '@nexio/component/ui/button';
import { ConfirmModal } from '@nexio/component/ui/modal';
import { DocService } from '@nexio/core/modules/doc';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { useI18n } from '@nexio/i18n';
import { DeleteIcon, ResetIcon } from '@canvas/icons/rc';
import { useService } from '@ezeslucky/infra';
import { useCallback, useState } from 'react';

import { useAppSettingHelper } from '../../hooks/nexio/use-app-setting-helper';
import { useBlockSuiteMetaHelper } from '../../hooks/nexio/use-block-suite-meta-helper';
import { useNavigateHelper } from '../../../components/hooks/use-navigate-helper';
import { toast } from '../../../utils';
import * as styles from './styles.css';

export const TrashPageFooter = () => {
  const workspace = useService(WorkspaceService).workspace;
  const docCollection = workspace.docCollection;
  const doc = useService(DocService).doc;
  const t = useI18n();
  const { appSettings } = useAppSettingHelper();
  const { jumpToPage } = useNavigateHelper();
  const { restoreFromTrash } = useBlockSuiteMetaHelper();
  const [open, setOpen] = useState(false);
  const hintText = t['com.nexio.cmdk.nexio.editor.trash-footer-hint']();

  const onRestore = useCallback(() => {
    restoreFromTrash(doc.id);
    toast(
      t['com.nexio.toastMessage.restored']({
        title: doc.meta$.value.title || 'Untitled',
      })
    );
  }, [doc.id, doc.meta$.value.title, restoreFromTrash, t]);

  const onConfirmDelete = useCallback(() => {
    jumpToPage(workspace.id, 'all');
    docCollection.removeDoc(doc.id);
    toast(t['com.nexio.toastMessage.permanentlyDeleted']());
  }, [jumpToPage, workspace.id, docCollection, doc.id, t]);

  const onDelete = useCallback(() => {
    setOpen(true);
  }, []);

  return (
    <div
      className={styles.deleteHintContainer}
      data-has-background={!appSettings.clientBorder}
    >
      <div className={styles.deleteHintText}>{hintText}</div>
      <div className={styles.group}>
        <Button
          tooltip={t['com.nexio.trashOperation.restoreIt']()}
          data-testid="page-restore-button"
          variant="primary"
          onClick={onRestore}
          className={styles.buttonContainer}
          prefix={<ResetIcon />}
          prefixClassName={styles.icon}
        />
        <Button
          tooltip={t['com.nexio.trashOperation.deletePermanently']()}
          variant="error"
          onClick={onDelete}
          className={styles.buttonContainer}
          prefix={<DeleteIcon />}
          prefixClassName={styles.icon}
        />
      </div>
      <ConfirmModal
        title={t['com.nexio.trashOperation.delete.title']()}
        cancelText={t['com.nexio.confirmModal.button.cancel']()}
        description={t['com.nexio.trashOperation.delete.description']()}
        confirmText={t['com.nexio.trashOperation.delete']()}
        confirmButtonOptions={{
          variant: 'error',
        }}
        open={open}
        onConfirm={onConfirmDelete}
        onOpenChange={setOpen}
      />
    </div>
  );
};
