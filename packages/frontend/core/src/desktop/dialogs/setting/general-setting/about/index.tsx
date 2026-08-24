import { Switch } from '@nexio/component';
import {
  SettingHeader,
  SettingRow,
  SettingWrapper,
} from '@nexio/component/setting-components';
import { useAppUpdater } from '@nexio/core/components/hooks/use-app-updater';
import { UrlService } from '@nexio/core/modules/url';
import { appIconMap, appNames } from '@nexio/core/utils/channel';
import { useI18n } from '@nexio/i18n';
import { ArrowRightSmallIcon, OpenInNewIcon } from '@canvas/icons/rc';
import { useServices } from '@ezeslucky/infra';
import { useCallback } from 'react';

import { useAppSettingHelper } from '../../../../../components/hooks/nexio/use-app-setting-helper';
import { relatedLinks } from './config';
import * as styles from './style.css';
import { UpdateCheckSection } from './update-check-section';

export const AboutNexio = () => {
  const t = useI18n();
  const { appSettings, updateSettings } = useAppSettingHelper();
  const { toggleAutoCheck, toggleAutoDownload } = useAppUpdater();
  const channel = BUILD_CONFIG.appBuildType;
  const appIcon = appIconMap[channel];
  const appName = appNames[channel];
  const { urlService } = useServices({
    UrlService,
  });

  const onSwitchAutoCheck = useCallback(
    (checked: boolean) => {
      toggleAutoCheck(checked);
      updateSettings('autoCheckUpdate', checked);
    },
    [toggleAutoCheck, updateSettings]
  );

  const onSwitchAutoDownload = useCallback(
    (checked: boolean) => {
      toggleAutoDownload(checked);
      updateSettings('autoDownloadUpdate', checked);
    },
    [toggleAutoDownload, updateSettings]
  );

  const onSwitchTelemetry = useCallback(
    (checked: boolean) => {
      updateSettings('enableTelemetry', checked);
    },
    [updateSettings]
  );

  return (
    <>
      <SettingHeader
        title={t['com.nexio.aboutnexio.title']()}
        subtitle={t['com.nexio.aboutnexio.subtitle']()}
        data-testid="about-title"
      />
      <SettingWrapper title={t['com.nexio.aboutnexio.version.title']()}>
        <SettingRow
          name={appName}
          desc={BUILD_CONFIG.appVersion}
          className={styles.appImageRow}
        >
          <img src={appIcon} alt={appName} width={56} height={56} />
        </SettingRow>
        <SettingRow
          name={t['com.nexio.aboutnexio.version.editor.title']()}
          desc={BUILD_CONFIG.editorVersion}
        />
        {BUILD_CONFIG.isElectron ? (
          <>
            <UpdateCheckSection />
            <SettingRow
              name={t['com.nexio.aboutnexio.autoCheckUpdate.title']()}
              desc={t['com.nexio.aboutnexio.autoCheckUpdate.description']()}
            >
              <Switch
                checked={appSettings.autoCheckUpdate}
                onChange={onSwitchAutoCheck}
              />
            </SettingRow>
            <SettingRow
              name={t['com.nexio.aboutnexio.autoDownloadUpdate.title']()}
              desc={t[
                'com.nexio.aboutnexio.autoDownloadUpdate.description'
              ]()}
            >
              <Switch
                checked={appSettings.autoDownloadUpdate}
                onChange={onSwitchAutoDownload}
              />
            </SettingRow>
            <SettingRow
              name={t['com.nexio.aboutnexio.changelog.title']()}
              desc={t['com.nexio.aboutnexio.changelog.description']()}
              style={{ cursor: 'pointer' }}
              onClick={() => {
                urlService.openPopupWindow(BUILD_CONFIG.changelogUrl);
              }}
            >
              <ArrowRightSmallIcon />
            </SettingRow>
          </>
        ) : null}
        <SettingRow
          name={t['com.nexio.telemetry.enable']()}
          desc={t['com.nexio.telemetry.enable.desc']()}
        >
          <Switch
            checked={appSettings.enableTelemetry !== false}
            onChange={onSwitchTelemetry}
          />
        </SettingRow>
      </SettingWrapper>
      <SettingWrapper title={t['com.nexio.aboutnexio.contact.title']()}>
        <a
          className={styles.link}
          rel="noreferrer"
          href="https://nexio.pro"
          target="_blank"
        >
          {t['com.nexio.aboutnexio.contact.website']()}
          <OpenInNewIcon className="icon" />
        </a>
        <a
          className={styles.link}
          rel="noreferrer"
          href="https://community.nexio.pro"
          target="_blank"
        >
          {t['com.nexio.aboutnexio.contact.community']()}
          <OpenInNewIcon className="icon" />
        </a>
      </SettingWrapper>
      <SettingWrapper title={t['com.nexio.aboutnexio.community.title']()}>
        <div className={styles.communityWrapper}>
          {relatedLinks.map(({ icon, title, link }) => {
            return (
              <div
                className={styles.communityItem}
                onClick={() => {
                  urlService.openPopupWindow(link);
                }}
                key={title}
              >
                {icon}
                <p>{title}</p>
              </div>
            );
          })}
        </div>
      </SettingWrapper>
      <SettingWrapper title={t['com.nexio.aboutnexio.legal.title']()}>
        <a
          className={styles.link}
          rel="noreferrer"
          href="https://nexio.pro/privacy"
          target="_blank"
        >
          {t['com.nexio.aboutnexio.legal.privacy']()}
          <OpenInNewIcon className="icon" />
        </a>
        <a
          className={styles.link}
          rel="noreferrer"
          href="https://nexio.pro/terms"
          target="_blank"
        >
          {t['com.nexio.aboutnexio.legal.tos']()}
          <OpenInNewIcon className="icon" />
        </a>
      </SettingWrapper>
    </>
  );
};
