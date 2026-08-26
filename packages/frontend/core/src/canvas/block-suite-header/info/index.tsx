import { IconButton } from '@nexio/component';
import { WorkspaceDialogService } from '@nexio/core/modules/dialogs';
import { useI18n } from '@nexio/i18n';
import { track } from '@nexio/track';
import { InformationIcon } from '@canvas/icons/rc';
import { useService } from '@ezeslucky/infra';
import { useCallback } from 'react';

export const InfoButton = ({ docId }: { docId: string }) => {
  const workspaceDialogService = useService(WorkspaceDialogService);
  const t = useI18n();

  const onOpenInfoModal = useCallback(() => {
    track.$.header.actions.openDocInfo();
    workspaceDialogService.open('doc-info', { docId });
  }, [docId, workspaceDialogService]);

  return (
    <IconButton
      size="20"
      tooltip={t['com.nexio.page-properties.page-info.view']()}
      data-testid="header-info-button"
      onClick={onOpenInfoModal}
    >
      <InformationIcon />
    </IconButton>
  );
};
