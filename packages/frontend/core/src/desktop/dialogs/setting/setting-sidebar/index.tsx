import { Scrollable } from '@nexio/component';
import { Avatar } from '@nexio/component/ui/avatar';
import { UserPlanButton } from '@nexio/core/components/nexio/auth/user-plan-button';
import { useCatchEventCallback } from '@nexio/core/components/hooks/use-catch-event-hook';
import { AuthService } from '@nexio/core/modules/cloud';
import { GlobalDialogService } from '@nexio/core/modules/dialogs';
import type { SettingTab } from '@nexio/core/modules/dialogs/constant';
import { type WorkspaceMetadata } from '@nexio/core/modules/workspace';
import { useI18n } from '@nexio/i18n';
import { track } from '@nexio/track';
import { Logo1Icon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import clsx from 'clsx';
import {
  type HTMLAttributes,
  type ReactNode,
  Suspense,
  useCallback,
  useMemo,
} from 'react';

import { useGeneralSettingList } from '../general-setting';
import { useWorkspaceSettingList } from '../workspace-setting';
import * as style from './style.css';

export type UserInfoProps = {
  onAccountSettingClick: () => void;
  onTabChange: (
    key: SettingTab,
    workspaceMetadata: WorkspaceMetadata | null
  ) => void;
  active?: boolean;
};

export const UserInfo = ({
  onAccountSettingClick,
  onTabChange,
  active,
}: UserInfoProps) => {
  const account = useLiveData(useService(AuthService).session.account$);

  const onClick = useCatchEventCallback(() => {
    onTabChange('plans', null);
  }, [onTabChange]);

  if (!account) {
    // TODO(@eyhn): loading ui
    return;
  }
  return (
    <div
      data-testid="user-info-card"
      className={clsx(style.accountButton, {
        active: active,
      })}
      onClick={onAccountSettingClick}
    >
      <Avatar
        size={28}
        rounded={2}
        name={account.label}
        url={account.avatar}
        className="avatar"
      />

      <div className="content">
        <div className="name-container">
          <div className="name" title={account.label}>
            {account.label}
          </div>
          <UserPlanButton onClick={onClick} />
        </div>

        <div className="email" title={account.email}>
          {account.email}
        </div>
      </div>
    </div>
  );
};

export const SignInButton = () => {
  const t = useI18n();
  const globalDialogService = useService(GlobalDialogService);

  return (
    <div
      className={style.accountButton}
      onClick={useCallback(() => {
        globalDialogService.open('sign-in', {});
      }, [globalDialogService])}
    >
      <div className="avatar not-sign">
        <Logo1Icon />
      </div>

      <div className="content">
        <div className="name" title={t['com.nexio.settings.sign']()}>
          {t['com.nexio.settings.sign']()}
        </div>
        <div className="email" title={t['com.nexio.setting.sign.message']()}>
          {t['com.nexio.setting.sign.message']()}
        </div>
      </div>
    </div>
  );
};

type SettingSidebarItemProps = {
  isActive: boolean;
  icon: ReactNode;
  title: string;
  key: string;
  testId?: string;
  beta?: boolean;
} & HTMLAttributes<HTMLDivElement>;

const SettingSidebarItem = ({
  isActive,
  icon,
  title,
  testId,
  beta,
  ...props
}: SettingSidebarItemProps) => {
  return (
    <div
      {...props}
      title={title}
      data-testid={testId}
      className={clsx(style.sidebarSelectItem, {
        active: isActive,
      })}
    >
      <div className={style.sidebarSelectItemIcon}>{icon}</div>
      <div className={style.sidebarSelectItemName}>{title}</div>
      {beta ? <div className={style.sidebarSelectItemBeta}>Beta</div> : null}
    </div>
  );
};

const SettingSidebarGroup = ({
  title,
  items,
}: {
  title: string;
  items: SettingSidebarItemProps[];
}) => {
  return (
    <div className={style.sidebarGroup}>
      <div className={style.sidebarSubtitle}>{title}</div>
      <div className={style.sidebarItemsWrapper}>
        {items.map(({ key, ...props }) => (
          <SettingSidebarItem key={key} {...props} />
        ))}
      </div>
    </div>
  );
};

export const SettingSidebar = ({
  activeTab,
  onTabChange,
}: {
  activeTab: SettingTab;
  onTabChange: (key: SettingTab) => void;
}) => {
  const t = useI18n();
  const loginStatus = useLiveData(useService(AuthService).session.status$);
  const generalList = useGeneralSettingList();
  const workspaceSettingList = useWorkspaceSettingList();
  const gotoTab = useCallback(
    (tab: SettingTab) => {
      track.$.settingsPanel.menu.openSettings({ to: tab });
      onTabChange(tab);
    },
    [onTabChange]
  );
  const onAccountSettingClick = useCallback(() => {
    track.$.settingsPanel.menu.openSettings({ to: 'account' });
    onTabChange('account');
  }, [onTabChange]);

  const groups = useMemo(() => {
    const res = [
      {
        key: 'setting:general',
        title: t['com.nexio.settingSidebar.settings.general'](),
        items: generalList,
      },
      {
        key: 'setting:workspace',
        title: t['com.nexio.settingSidebar.settings.workspace'](),
        items: workspaceSettingList,
      },
    ].map(group => {
      return {
        ...group,
        items: group.items.map(item => {
          return {
            ...item,
            isActive: item.key === activeTab,
            'data-event-arg': item.key,
            onClick: () => gotoTab(item.key),
          };
        }),
      };
    });
    return res;
  }, [activeTab, generalList, gotoTab, t, workspaceSettingList]);

  return (
    <div className={style.settingSlideBar} data-testid="settings-sidebar">
      <div className={style.sidebarTitle}>
        {t['com.nexio.settingSidebar.title']()}
      </div>

      {loginStatus === 'unauthenticated' ? <SignInButton /> : null}
      {loginStatus === 'authenticated' ? (
        <Suspense>
          <UserInfo
            onAccountSettingClick={onAccountSettingClick}
            active={activeTab === 'account'}
            onTabChange={onTabChange}
          />
        </Suspense>
      ) : null}

      <Scrollable.Root>
        <Scrollable.Viewport>
          {groups.map(group => (
            <SettingSidebarGroup
              key={group.key}
              title={group.title}
              items={group.items}
            />
          ))}
          <Scrollable.Scrollbar />
        </Scrollable.Viewport>
      </Scrollable.Root>
    </div>
  );
};
