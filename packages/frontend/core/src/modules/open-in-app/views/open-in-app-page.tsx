import { Button } from '@nexio/component/ui/button';
import { WorkspaceDialogService } from '@nexio/core/modules/dialogs';
import { appIconMap, appNames } from '@nexio/core/utils/channel';
import { Trans, useI18n } from '@nexio/i18n';
import { LocalWorkspaceIcon, Logo1Icon } from '@blocksuite/icons/rc';
import { useServiceOptional } from '@ezeslucky/infra';
import type { MouseEvent } from 'react';
import { useCallback } from 'react';

import { getOpenUrlInDesktopAppLink } from '../utils';
import * as styles from './open-in-app-page.css';

let lastOpened = '';

interface OpenAppProps {
  urlToOpen?: string | null;
  openHereClicked?: (e: MouseEvent) => void;
  mode?: 'auth' | 'open-doc'; // default to 'auth'
}
//@ts-ignore
const channel = BUILD_CONFIG.appBuildType;
const url =
  'https://nexio.pro/download' + (channel !== 'stable' ? '/beta-canary' : '');

export const OpenInAppPage = ({
  urlToOpen,
  openHereClicked,
  mode = 'auth',
}: OpenAppProps) => {
  // default to open the current page in desktop app
  urlToOpen ??= getOpenUrlInDesktopAppLink(window.location.href, true);
  const workspaceDialogService = useServiceOptional(WorkspaceDialogService);
  const t = useI18n();

  const openDownloadLink = useCallback(() => {
    open(url, '_blank');
  }, []);
 //@ts-ignore
  const appIcon = appIconMap[channel];
  //@ts-ignore
  const appName = appNames[channel];

  const goToAppearanceSetting = useCallback(
    (e: MouseEvent) => {
      openHereClicked?.(e);
      workspaceDialogService?.open('setting', {
        activeTab: 'appearance',
      });
    },
    [workspaceDialogService, openHereClicked]
  );

  if (urlToOpen && lastOpened !== urlToOpen) {
    lastOpened = urlToOpen;
    location.href = urlToOpen;
  }

  if (!urlToOpen) {
    return null;
  }

  return (
    <div className={styles.root}>
      <div className={styles.topNav}>
        <a href="/" rel="noreferrer" className={styles.nexioLogo}>
          <Logo1Icon width={24} height={24} />
        </a>

        <div className={styles.topNavLinks}>
          <a
            href="https://nexio.pro"
            target="_blank"
            rel="noreferrer"
            className={styles.topNavLink}
          >
            Official Website
          </a>
          <a
            href="https://nexio.pro/blog"
            target="_blank"
            rel="noreferrer"
            className={styles.topNavLink}
          >
            Blog
          </a>
          <a
            href="https://nexio.pro/about-us"
            target="_blank"
            rel="noreferrer"
            className={styles.topNavLink}
          >
            Contact us
          </a>
        </div>

        <Button onClick={openDownloadLink}>
          {t['com.nexio.auth.open.nexio.download-app']()}
        </Button>
      </div>

      <div className={styles.centerContent}>
        <img src={appIcon} alt={appName} width={120} height={120} />

        <div className={styles.prompt}>
          {mode === 'open-doc' ? (
            <Trans i18nKey="com.nexio.auth.open.nexio.open-doc-prompt">
              This doc is now opened in {appName}
            </Trans>
          ) : (
            <Trans i18nKey="com.nexio.auth.open.nexio.prompt">
              Open {appName} app now
            </Trans>
          )}
        </div>

        <div className={styles.promptLinks}>
          {openHereClicked && (
            <a
              className={styles.promptLink}
              onClick={openHereClicked}
              target="_blank"
              rel="noreferrer"
            >
              {t['com.nexio.auth.open.nexio.doc.open-here']()}
            </a>
          )}
          <a
            className={styles.promptLink}
            href={urlToOpen}
            target="_blank"
            rel="noreferrer"
          >
            {t['com.nexio.auth.open.nexio.try-again']()}
          </a>
        </div>
      </div>

      {mode === 'open-doc' ? (
        <div className={styles.docFooter}>
          <button
            className={styles.editSettingsLink}
            onClick={goToAppearanceSetting}
          >
            {t['com.nexio.auth.open.nexio.doc.edit-settings']()}
          </button>

          <div className={styles.docFooterText}>
            <LocalWorkspaceIcon width={16} height={16} />
            {t['com.nexio.auth.open.nexio.doc.footer-text']()}
          </div>
        </div>
      ) : null}
    </div>
  );
};
