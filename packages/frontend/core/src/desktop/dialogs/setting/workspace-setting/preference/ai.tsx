import { Switch } from '@nexio/component';
import {
  SettingRow,
  SettingWrapper,
} from '@nexio/component/setting-components';
import { useAsyncCallback } from '@nexio/core/components/hooks/nexio-async-hooks';
import { ServerService } from '@nexio/core/modules/cloud';
import { WorkspacePermissionService } from '@nexio/core/modules/permissions';
import { WorkspaceShareSettingService } from '@nexio/core/modules/share-setting';
import { useI18n } from '@nexio/i18n';
import { useLiveData, useService } from '@toeverything/infra';

export const AiSetting = () => {
  const t = useI18n();
  const shareSetting = useService(WorkspaceShareSettingService).sharePreview;
  const serverService = useService(ServerService);
  const serverEnableAi = useLiveData(
    serverService.server.features$.map(f => f?.copilot)
  );
  const workspaceEnableAi = useLiveData(shareSetting.enableAi$);
  const loading = useLiveData(shareSetting.isLoading$);
  const permissionService = useService(WorkspacePermissionService);
  const isOwner = useLiveData(permissionService.permission.isOwner$);

  const toggleAi = useAsyncCallback(
    async (checked: boolean) => {
      await shareSetting.setEnableAi(checked);
    },
    [shareSetting]
  );

  if (!isOwner || !serverEnableAi) {
    return null;
  }

  return (
    <SettingWrapper
      title={t['com.nexio.settings.workspace.nexio-ai.title']()}
    >
      <SettingRow
        name={t['com.nexio.settings.workspace.nexio-ai.label']()}
        desc={t['com.nexio.settings.workspace.nexio-ai.description']()}
      >
        <Switch
          checked={!!workspaceEnableAi}
          onChange={toggleAi}
          disabled={loading}
        />
      </SettingRow>
    </SettingWrapper>
  );
};
