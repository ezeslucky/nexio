import { notify } from '@nexio/component';
import { AuthService } from '@nexio/core/modules/cloud';
import type {
  DialogComponentProps,
  WORKSPACE_DIALOG_SCHEMA,
} from '@nexio/core/modules/dialogs';
import { UrlService } from '@nexio/core/modules/url';
import { copyTextToClipboard } from '@nexio/core/utils/clipboard';
import { useI18n } from '@nexio/i18n';
import { useLiveData, useService } from '@toeverything/infra';
import { useCallback, useEffect } from 'react';

import { AboutGroup } from './about';
import { AppearanceGroup } from './appearance';
import { DevicesGroup } from './devices';
import { ExperimentalFeatureSetting } from './experimental';
import { SettingGroup } from './group';
import { OthersGroup } from './others';
import { DeleteAccount } from './others/delete-account';
import { RowLayout } from './row.layout';
import * as styles from './style.css';
import { PlansGroup } from './subscription';
import { SwipeDialog } from './swipe-dialog';
import { UserProfile } from './user-profile';
import { UserUsage } from './user-usage';

const NEXIO_MOBILE_STORE_URL = undefined;
const NEXIO_DOWNLOAD_URL =
  typeof window !== 'undefined' ? window.location.origin : '/';

const SupportGroup = () => {
  const t = useI18n();
  const urlService = useService(UrlService);

  const shareApp = useCallback(async () => {
    const shareData = {
      title: 'Nexio',
      text: t['com.affine.mobile.setting.support.invite-message'](),
      url: NEXIO_DOWNLOAD_URL,
    };

    if ('share' in navigator && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') {
          return;
        }
      }
    }

    const copied = await copyTextToClipboard(NEXIO_DOWNLOAD_URL);
    if (copied) {
      notify.success({ title: t['Copied link to clipboard']() });
      return;
    }

    urlService.openExternal(NEXIO_DOWNLOAD_URL);
  }, [t, urlService]);

  return (
    <SettingGroup title={t['com.affine.mobile.setting.support.title']()}>
      {NEXIO_MOBILE_STORE_URL ? (
        <RowLayout
          label={t['com.affine.mobile.setting.support.rate']()}
          onClick={() => urlService.openExternal(NEXIO_MOBILE_STORE_URL)}
        />
      ) : null}
      <RowLayout
        label={t['com.affine.mobile.setting.support.invite']()}
        onClick={() => void shareApp()}
      />
    </SettingGroup>
  );
};

const DangerZoneGroup = ({
  onDeleteFinished,
}: {
  onDeleteFinished?: () => void;
}) => {
  const t = useI18n();
  const authService = useService(AuthService);
  const account = useLiveData(authService.session.account$);

  if (!account) {
    return null;
  }

  return (
    <SettingGroup
      title={
        <span className={styles.dangerZoneTitle}>
          {t['com.affine.mobile.setting.danger-zone.title']()}
        </span>
      }
    >
      <DeleteAccount onDeleteFinished={onDeleteFinished} />
    </SettingGroup>
  );
};

const MobileSetting = ({
  onDeleteFinished,
}: {
  onDeleteFinished?: () => void;
}) => {
  const session = useService(AuthService).session;
  const status = useLiveData(session.status$);

  useEffect(() => {
    session.revalidate();
  }, [session]);

  return (
    <div className={styles.root}>
      <UserProfile />
      <UserUsage />
      <PlansGroup />
      {status === 'authenticated' ? <DevicesGroup /> : null}
      <AppearanceGroup />
      <AboutGroup />
      <ExperimentalFeatureSetting />
      <SupportGroup />
      <OthersGroup />
      <DangerZoneGroup onDeleteFinished={onDeleteFinished} />
    </div>
  );
};

export const SettingDialog = ({
  close,
}: DialogComponentProps<WORKSPACE_DIALOG_SCHEMA['setting']>) => {
  const t = useI18n();

  return (
    <SwipeDialog
      title={t['com.affine.mobile.setting.header-title']()}
      open
      onOpenChange={() => close()}
    >
      <MobileSetting onDeleteFinished={close} />
    </SwipeDialog>
  );
};
