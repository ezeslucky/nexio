import { useWorkspaceInfo } from '@nexio/core/components/hooks/use-workspace-info';
import { ServerService } from '@nexio/core/modules/cloud';
import type { SettingTab } from '@nexio/core/modules/dialogs/constant';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { EmbeddingSettings } from '@nexio/core/modules/workspace-indexer-embedding';
import { ServerDeploymentType } from '@nexio/graphql';
import { useI18n } from '@nexio/i18n';
import {
  AiEmbeddingIcon,
  CollaborationIcon,
  IntegrationsIcon,
  PaymentIcon,
  PropertyIcon,
  SaveIcon,
  SettingsIcon,
} from '@canvas/icons/rc';
import { useLiveData, useService } from '@ezeslucky/infra';
import { useMemo } from 'react';

import type { SettingSidebarItem, SettingState } from '../types';
import { WorkspaceSettingBilling } from './billing';
import { IntegrationSetting } from './integration';
import { WorkspaceSettingLicense } from './license';
import { MembersPanel } from './members';
import { WorkspaceSettingDetail } from './preference';
import { WorkspaceSettingProperties } from './properties';
import { WorkspaceSettingStorage } from './storage';

export const WorkspaceSetting = ({
  activeTab,
  onCloseSetting,
  onChangeSettingState,
}: {
  activeTab: SettingTab;
  onCloseSetting: () => void;
  onChangeSettingState: (settingState: SettingState) => void;
}) => {
  switch (activeTab) {
    case 'workspace:preference':
      return <WorkspaceSettingDetail onCloseSetting={onCloseSetting} />;
    case 'workspace:properties':
      return <WorkspaceSettingProperties />;
    case 'workspace:members':
      return (
        <MembersPanel
          onCloseSetting={onCloseSetting}
          onChangeSettingState={onChangeSettingState}
        />
      );
    case 'workspace:billing':
      return <WorkspaceSettingBilling />;
    case 'workspace:storage':
      return <WorkspaceSettingStorage onCloseSetting={onCloseSetting} />;
    case 'workspace:license':
      return <WorkspaceSettingLicense onCloseSetting={onCloseSetting} />;
    case 'workspace:integrations':
      return <IntegrationSetting />;
    case 'workspace:embedding':
      return <EmbeddingSettings />;
    default:
      return null;
  }
};

export const useWorkspaceSettingList = (): SettingSidebarItem[] => {
  const workspaceService = useService(WorkspaceService);
  const information = useWorkspaceInfo(workspaceService.workspace);
  const serverService = useService(ServerService);

  const isSelfhosted = useLiveData(
    serverService.server.config$.selector(
      c => c.type === ServerDeploymentType.Selfhosted
    )
  );

  const t = useI18n();

  const showBilling =
    !isSelfhosted && information?.isTeam && information?.isOwner;
  const showLicense = information?.isOwner && isSelfhosted;
  const items = useMemo<SettingSidebarItem[]>(() => {
    return [
      {
        key: 'workspace:preference',
        title: t['com.nexio.settings.workspace.preferences'](),
        icon: <SettingsIcon />,
        testId: 'workspace-setting:preference',
      },
      {
        key: 'workspace:properties',
        title: t['com.nexio.settings.workspace.properties'](),
        icon: <PropertyIcon />,
        testId: 'workspace-setting:properties',
      },
      {
        key: 'workspace:members',
        title: t['Members'](),
        icon: <CollaborationIcon />,
        testId: 'workspace-setting:members',
      },
      {
        key: 'workspace:integrations',
        title: t['com.nexio.integration.integrations'](),
        icon: <IntegrationsIcon />,
        testId: 'workspace-setting:integrations',
      },
      {
        key: 'workspace:storage',
        title: t['Storage'](),
        icon: <SaveIcon />,
        testId: 'workspace-setting:storage',
      },
      {
        key: 'workspace:embedding',
        title:
          t[
            'com.nexio.settings.workspace.indexer-embedding.embedding.title'
          ](),
        icon: <AiEmbeddingIcon />,
        testId: 'workspace-setting:embedding',
      },
      showBilling && {
        key: 'workspace:billing' as SettingTab,
        title: t['com.nexio.settings.workspace.billing'](),
        icon: <PaymentIcon />,
        testId: 'workspace-setting:billing',
      },
      showLicense && {
        key: 'workspace:license' as SettingTab,
        title: t['com.nexio.settings.workspace.license'](),
        icon: <PaymentIcon />,
        testId: 'workspace-setting:license',
      },
    ].filter((item): item is SettingSidebarItem => !!item);
  }, [showBilling, showLicense, t]);

  return items;
};
