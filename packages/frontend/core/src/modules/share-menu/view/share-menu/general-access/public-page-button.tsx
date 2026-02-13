import { Menu, MenuItem, MenuTrigger, notify } from '@nexio/component';
import { useAsyncCallback } from '@nexio/core/components/hooks/nexio-async-hooks';
import { ShareInfoService } from '@nexio/core/modules/share-doc';
import { UserFriendlyError } from '@nexio/error';
import { PublicDocMode } from '@nexio/graphql';
import { useI18n } from '@nexio/i18n';
import track from '@nexio/track';
import {
  LockIcon,
  SingleSelectCheckSolidIcon,
  ViewIcon,
} from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import { cssVar } from '@toeverything/theme';
import clsx from 'clsx';
import { useEffect } from 'react';

import * as styles from './styles.css';

export const PublicDoc = ({ disabled }: { disabled?: boolean }) => {
  const t = useI18n();
  const shareInfoService = useService(ShareInfoService);
  const isSharedPage = useLiveData(shareInfoService.shareInfo.isShared$);
  const isRevalidating = useLiveData(
    shareInfoService.shareInfo.isRevalidating$
  );

  useEffect(() => {
    shareInfoService.shareInfo.revalidate();
  }, [shareInfoService]);

  const onDisablePublic = useAsyncCallback(async () => {
    try {
      await shareInfoService.shareInfo.disableShare();
      notify.error({
        title:
          t[
            'com.nexio.share-menu.disable-publish-link.notification.success.title'
          ](),
        message:
          t[
            'com.nexio.share-menu.disable-publish-link.notification.success.message'
          ](),
      });
    } catch (err) {
      notify.error({
        title:
          t[
            'com.nexio.share-menu.disable-publish-link.notification.fail.title'
          ](),
        message:
          t[
            'com.nexio.share-menu.disable-publish-link.notification.fail.message'
          ](),
      });
      console.log(err);
    }
  }, [shareInfoService, t]);

  const onClickAnyoneReadOnlyShare = useAsyncCallback(async () => {
    if (isSharedPage) {
      return;
    }
    try {
      // TODO(@JimmFly): remove mode when we have a better way to handle it
      await shareInfoService.shareInfo.enableShare(PublicDocMode.Page);
      track.$.sharePanel.$.createShareLink();
      notify.success({
        title:
          t[
            'com.nexio.share-menu.create-public-link.notification.success.title'
          ](),
        message:
          t[
            'com.nexio.share-menu.create-public-link.notification.success.message'
          ](),
        style: 'normal',
        icon: <SingleSelectCheckSolidIcon color={cssVar('primaryColor')} />,
      });
    } catch (error) {
      const err = UserFriendlyError.fromAny(error);
      notify.error({
        title: err.name,
        message: err.message,
      });
    }
  }, [isSharedPage, shareInfoService.shareInfo, t]);

  return (
    <div className={styles.rowContainerStyle}>
      <div className={styles.labelStyle}>
        {t['com.nexio.share-menu.option.link.label']()}
      </div>
      {disabled ? (
        <div className={clsx(styles.menuTriggerStyle, 'disable')}>
          <div className={styles.menuTriggerText}>
            {isSharedPage
              ? t['com.nexio.share-menu.option.link.readonly']()
              : t['com.nexio.share-menu.option.link.no-access']()}
          </div>
        </div>
      ) : (
        <Menu
          contentOptions={{
            align: 'end',
          }}
          items={
            <>
              <MenuItem
                prefixIcon={<LockIcon />}
                onSelect={onDisablePublic}
                selected={!isSharedPage}
              >
                <div className={styles.publicItemRowStyle}>
                  <div>
                    {t['com.nexio.share-menu.option.link.no-access']()}
                  </div>
                </div>
              </MenuItem>
              <MenuItem
                prefixIcon={<ViewIcon />}
                onSelect={onClickAnyoneReadOnlyShare}
                data-testid="share-link-menu-enable-share"
                selected={!!isSharedPage}
              >
                <div className={styles.publicItemRowStyle}>
                  <div>{t['com.nexio.share-menu.option.link.readonly']()}</div>
                </div>
              </MenuItem>
            </>
          }
        >
          <MenuTrigger
            className={styles.menuTriggerStyle}
            data-testid="share-link-menu-trigger"
            variant="plain"
            suffixClassName={styles.suffixClassName}
            contentStyle={{
              width: '100%',
            }}
            loading={isRevalidating}
            disabled={isRevalidating}
          >
            {isSharedPage
              ? t['com.nexio.share-menu.option.link.readonly']()
              : t['com.nexio.share-menu.option.link.no-access']()}
          </MenuTrigger>
        </Menu>
      )}
    </div>
  );
};
