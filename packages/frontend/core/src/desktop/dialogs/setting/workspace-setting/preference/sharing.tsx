import { Switch } from '@nexio/component';
import {
  SettingRow,
  SettingWrapper,
} from '@nexio/component/setting-components';
import { useAsyncCallback } from '@nexio/core/components/hooks/nexio-async-hooks';
import { WorkspacePermissionService } from '@nexio/core/modules/permissions';
import { WorkspaceShareSettingService } from '@nexio/core/modules/share-setting';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { useI18n } from '@nexio/i18n';
import { useLiveData, useService } from '@ezeslucky/infra';

export const SharingPanel = () => {
  const workspace = useService(WorkspaceService).workspace;
  if (workspace.flavour === 'local') {
    return null;
  }
  return <Sharing />;
};

export const Sharing = () => {
  const t = useI18n();
  const shareSetting = useService(WorkspaceShareSettingService).sharePreview;
  const enableUrlPreview = useLiveData(shareSetting.enableUrlPreview$);
  const loading = useLiveData(shareSetting.isLoading$);
  const permissionService = useService(WorkspacePermissionService);
  const isOwner = useLiveData(permissionService.permission.isOwner$);

  const handleCheck = useAsyncCallback(
    async (checked: boolean) => {
      await shareSetting.setEnableUrlPreview(checked);
    },
    [shareSetting]
  );

  if (!isOwner) {
    return null;
  }

  return (
    <SettingWrapper title={t['com.nexio.settings.workspace.sharing.title']()}>
      <SettingRow
        name={t['com.nexio.settings.workspace.sharing.url-preview.title']()}
        desc={t[
          'com.nexio.settings.workspace.sharing.url-preview.description'
        ]()}
      >
        <Switch
          checked={enableUrlPreview || false}
          onChange={handleCheck}
          disabled={loading}
        />
      </SettingRow>
    </SettingWrapper>
  );
};
