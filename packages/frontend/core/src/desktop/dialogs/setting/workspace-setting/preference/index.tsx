import {
  SettingHeader,
  SettingRow,
  SettingWrapper,
} from '@nexio/component/setting-components';
import { useWorkspaceInfo } from '@nexio/core/components/hooks/use-workspace-info';
import { WorkspaceServerService } from '@nexio/core/modules/cloud';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { UNTITLED_WORKSPACE_NAME } from '@nexio/env/constant';
import { useI18n } from '@nexio/i18n';
import { ArrowRightSmallIcon } from '@blocksuite/icons/rc';
import { FrameworkScope, useService } from '@ezeslucky/infra';
import { useCallback } from 'react';

import { DeleteLeaveWorkspace } from './delete-leave-workspace';
import { EnableCloudPanel } from './enable-cloud';
import { LabelsPanel } from './labels';
import { ProfilePanel } from './profile';
import { SharingPanel } from './sharing';
import { TemplateDocSetting } from './template';
import type { WorkspaceSettingDetailProps } from './types';

export const WorkspaceSettingDetail = ({
  onCloseSetting,
}: WorkspaceSettingDetailProps) => {
  const t = useI18n();

  const workspace = useService(WorkspaceService).workspace;
  const server = workspace?.scope.get(WorkspaceServerService).server;

  const workspaceInfo = useWorkspaceInfo(workspace);

  const handleResetSyncStatus = useCallback(() => {
    workspace?.engine.doc
      .resetSync()
      .then(() => {
        onCloseSetting();
      })
      .catch(err => {
        console.error(err);
      });
  }, [onCloseSetting, workspace]);

  return (
    <FrameworkScope scope={server?.scope}>
      <SettingHeader
        title={t[`Workspace Settings with name`]({
          name: workspaceInfo?.name ?? UNTITLED_WORKSPACE_NAME,
        })}
        subtitle={t['com.nexio.settings.workspace.description']()}
      />
      <SettingWrapper title={t['Info']()}>
        <SettingRow
          name={t['Workspace Profile']()}
          desc={t['com.nexio.settings.workspace.not-owner']()}
          spreadCol={false}
        >
          <ProfilePanel />
          <LabelsPanel />
          {workspace.flavour === 'local' && (
            <EnableCloudPanel onCloseSetting={onCloseSetting} />
          )}
        </SettingRow>
      </SettingWrapper>
      <TemplateDocSetting />
      <SharingPanel />
      <SettingWrapper>
        <DeleteLeaveWorkspace onCloseSetting={onCloseSetting} />
        <SettingRow
          name={
            <span style={{ color: 'var(--nexio-text-secondary-color)' }}>
              {t['com.nexio.resetSyncStatus.button']()}
            </span>
          }
          desc={t['com.nexio.resetSyncStatus.description']()}
          style={{ cursor: 'pointer' }}
          onClick={handleResetSyncStatus}
          data-testid="reset-sync-status"
        >
          <ArrowRightSmallIcon />
        </SettingRow>
      </SettingWrapper>
    </FrameworkScope>
  );
};
