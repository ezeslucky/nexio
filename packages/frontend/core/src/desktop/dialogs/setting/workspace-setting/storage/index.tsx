import {
  SettingHeader,
  SettingWrapper,
} from '@nexio/component/setting-components';
import { WorkspacePermissionService } from '@nexio/core/modules/permissions';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { useI18n } from '@nexio/i18n';
import { useLiveData, useService } from '@ezeslucky/infra';

import { EnableCloudPanel } from '../preference/enable-cloud';
import { BlobManagementPanel } from './blob-management';
import { DesktopExportPanel } from './export';
import { WorkspaceQuotaPanel } from './workspace-quota';

export const WorkspaceSettingStorage = ({
  onCloseSetting,
}: {
  onCloseSetting: () => void;
}) => {
  const t = useI18n();
  const workspace = useService(WorkspaceService).workspace;
  const workspacePermissionService = useService(
    WorkspacePermissionService
  ).permission;
  const isTeam = useLiveData(workspacePermissionService.isTeam$);
  const isOwner = useLiveData(workspacePermissionService.isOwner$);

  const canExport = !isTeam || isOwner;
  return (
    <>
      <SettingHeader
        title={t['Storage']()}
        subtitle={t['com.nexio.settings.workspace.storage.subtitle']()}
      />
      {workspace.flavour === 'local' ? (
        <>
          <EnableCloudPanel onCloseSetting={onCloseSetting} />{' '}
          {BUILD_CONFIG.isElectron && (
            <SettingWrapper>
              <DesktopExportPanel workspace={workspace} />
            </SettingWrapper>
          )}
        </>
      ) : (
        <>
          {isTeam ? (
            <SettingWrapper>
              <WorkspaceQuotaPanel />
            </SettingWrapper>
          ) : null}

          {BUILD_CONFIG.isElectron && canExport && (
            <SettingWrapper>
              <DesktopExportPanel workspace={workspace} />
            </SettingWrapper>
          )}

          <SettingWrapper>
            <BlobManagementPanel />
          </SettingWrapper>
        </>
      )}
    </>
  );
};
