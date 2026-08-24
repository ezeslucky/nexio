import { MenuItem } from '@nexio/component';
import { ServerService, UserFeatureService } from '@nexio/core/modules/cloud';
import { WorkspaceDialogService } from '@nexio/core/modules/dialogs';
import { useI18n } from '@nexio/i18n';
import { track } from '@nexio/track';
import { AccountIcon, AdminIcon, SignOutIcon } from '@canvas/icons/rc';
import { useLiveData, useService } from '@ezeslucky/infra';
import { useCallback, useEffect } from 'react';

import { useSignOut } from '../../hooks/nexio/use-sign-out';

export const AccountMenu = () => {
  const workspaceDialogService = useService(WorkspaceDialogService);
  const openSignOutModal = useSignOut();
  const serverService = useService(ServerService);
  const userFeatureService = useService(UserFeatureService);
  const isNEXIOAdmin = useLiveData(userFeatureService.userFeature.isAdmin$);

  const onOpenAccountSetting = useCallback(() => {
    track.$.navigationPanel.profileAndBadge.openSettings({ to: 'account' });
    workspaceDialogService.open('setting', {
      activeTab: 'account',
    });
  }, [workspaceDialogService]);

  const onOpenAdminPanel = useCallback(() => {
    window.open(`${serverService.server.baseUrl}/admin`, '_blank');
  }, [serverService.server.baseUrl]);

  const t = useI18n();

  useEffect(() => {
    userFeatureService.userFeature.revalidate();
  }, [userFeatureService]);

  return (
    <>
      <MenuItem
        prefixIcon={<AccountIcon />}
        data-testid="workspace-modal-account-settings-option"
        onClick={onOpenAccountSetting}
      >
        {t['com.nexio.workspace.cloud.account.settings']()}
      </MenuItem>
      {isNEXIOAdmin ? (
        <MenuItem
          prefixIcon={<AdminIcon />}
          data-testid="workspace-modal-account-admin-option"
          onClick={onOpenAdminPanel}
        >
          {t['com.nexio.workspace.cloud.account.admin']()}
        </MenuItem>
      ) : null}
      <MenuItem
        prefixIcon={<SignOutIcon />}
        data-testid="workspace-modal-sign-out-option"
        onClick={openSignOutModal}
      >
        {t['com.nexio.workspace.cloud.account.logout']()}
      </MenuItem>
    </>
  );
};
