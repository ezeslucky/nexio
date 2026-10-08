import { MenuItem } from '@nexio/core/modules/app-sidebar/views';
import { WorkspaceDialogService } from '@nexio/core/modules/dialogs';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { useI18n } from '@nexio/i18n';
import { CollaborationIcon } from '@blocksuite/icons/rc';
import { useService } from '@toeverything/infra';
import { useCallback } from 'react';

export const InviteMembersButton = () => {
  const workspace = useService(WorkspaceService).workspace;

  const isLocal = workspace.flavour === 'local';

  const dialogService = useService(WorkspaceDialogService);
  const onOpenInviteMembersModal = useCallback(() => {
    dialogService.open('setting', {
      activeTab: `workspace:members`,
    });
  }, [dialogService]);

  const t = useI18n();

  if (isLocal) {
    return null;
  }

  return (
    <MenuItem
      data-testid="slider-bar-invite-members-button"
      icon={<CollaborationIcon />}
      onClick={onOpenInviteMembersModal}
    >
      {t['Invite Members']()}
    </MenuItem>
  );
};
