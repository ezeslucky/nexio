import type { RadioItem } from '@nexio/component';
import { RadioGroup, Switch } from '@nexio/component';
import {
  SettingHeader,
  SettingRow,
  SettingWrapper,
} from '@nexio/component/setting-components';
import { LanguageMenu } from '@nexio/core/components/nexio/language-menu';
import { TraySettingService } from '@nexio/core/modules/editor-setting/services/tray-settings';
import { FeatureFlagService } from '@nexio/core/modules/feature-flag';
import { useI18n } from '@nexio/i18n';
import { useLiveData, useService } from '@ezeslucky/infra';
import { useTheme } from 'next-themes';
import { useCallback, useMemo } from 'react';

import { useAppSettingHelper } from '../../../../../components/hooks/nexio/use-app-setting-helper';
import { OpenInAppLinksMenu } from './links';
import { settingWrapper } from './style.css';
import { ThemeEditorSetting } from './theme-editor-setting';

export const getThemeOptions = (t: ReturnType<typeof useI18n>) =>
  [
    {
      value: 'system',
      label: t['com.nexio.themeSettings.system'](),
      testId: 'system-theme-trigger',
    },
    {
      value: 'light',
      label: t['com.nexio.themeSettings.light'](),
      testId: 'light-theme-trigger',
    },
    {
      value: 'dark',
      label: t['com.nexio.themeSettings.dark'](),
      testId: 'dark-theme-trigger',
    },
  ] satisfies RadioItem[];

export const ThemeSettings = () => {
  const t = useI18n();
  const { setTheme, theme } = useTheme();

  const radioItems = useMemo<RadioItem[]>(() => getThemeOptions(t), [t]);

  return (
    <RadioGroup
      items={radioItems}
      value={theme}
      width={250}
      className={settingWrapper}
      onChange={useCallback(
        (value: string) => {
          setTheme(value);
        },
        [setTheme]
      )}
    />
  );
};

const MenubarSetting = () => {
  const t = useI18n();
  const traySettingService = useService(TraySettingService);
  const { enabled } = useLiveData(traySettingService.setting$);
  return (
    <SettingWrapper
      id="menubar"
      title={t['com.nexio.appearanceSettings.menubar.title']()}
    >
      <SettingRow
        name={t['com.nexio.appearanceSettings.menubar.toggle']()}
        desc={t['com.nexio.appearanceSettings.menubar.description']()}
      >
        <Switch
          checked={enabled}
          onChange={checked => traySettingService.setEnabled(checked)}
        />
      </SettingRow>
    </SettingWrapper>
  );
};

export const AppearanceSettings = () => {
  const t = useI18n();

  const featureFlagService = useService(FeatureFlagService);
  const enableThemeEditor = useLiveData(
    featureFlagService.flags.enable_theme_editor.$
  );
  const { appSettings, updateSettings } = useAppSettingHelper();

  return (
    <>
      <SettingHeader
        title={t['com.nexio.appearanceSettings.title']()}
        subtitle={t['com.nexio.appearanceSettings.subtitle']()}
      />

      <SettingWrapper title={t['com.nexio.appearanceSettings.theme.title']()}>
        <SettingRow
          name={t['com.nexio.appearanceSettings.color.title']()}
          desc={t['com.nexio.appearanceSettings.color.description']()}
        >
          <ThemeSettings />
        </SettingRow>
        <SettingRow
          name={t['com.nexio.appearanceSettings.language.title']()}
          desc={t['com.nexio.appearanceSettings.language.description']()}
        >
          <div className={settingWrapper}>
            <LanguageMenu />
          </div>
        </SettingRow>
        {BUILD_CONFIG.isElectron ? (
          <SettingRow
            name={t['com.nexio.appearanceSettings.clientBorder.title']()}
            desc={t['com.nexio.appearanceSettings.clientBorder.description']()}
            data-testid="client-border-style-trigger"
          >
            <Switch
              checked={appSettings.clientBorder}
              onChange={checked => updateSettings('clientBorder', checked)}
            />
          </SettingRow>
        ) : null}
        {enableThemeEditor ? <ThemeEditorSetting /> : null}
      </SettingWrapper>

      {BUILD_CONFIG.isWeb && !environment.isMobile ? (
        <SettingWrapper title={t['com.nexio.setting.appearance.links']()}>
          <SettingRow
            name={t['com.nexio.setting.appearance.open-in-app']()}
            desc={t['com.nexio.setting.appearance.open-in-app.hint']()}
            data-testid="open-in-app-links-trigger"
          >
            <OpenInAppLinksMenu />
          </SettingRow>
        </SettingWrapper>
      ) : null}

      <SettingWrapper
        title={t['com.nexio.appearanceSettings.sidebar.title']()}
      >
        {BUILD_CONFIG.isElectron ? (
          <SettingRow
            name={t['com.nexio.appearanceSettings.noisyBackground.title']()}
            desc={t[
              'com.nexio.appearanceSettings.noisyBackground.description'
            ]()}
          >
            <Switch
              checked={appSettings.enableNoisyBackground}
              onChange={checked =>
                updateSettings('enableNoisyBackground', checked)
              }
            />
          </SettingRow>
        ) : null}
        {BUILD_CONFIG.isElectron && environment.isMacOs && (
          <SettingRow
            name={t['com.nexio.appearanceSettings.translucentUI.title']()}
            desc={t[
              'com.nexio.appearanceSettings.translucentUI.description'
            ]()}
          >
            <Switch
              checked={appSettings.enableBlurBackground}
              onChange={checked =>
                updateSettings('enableBlurBackground', checked)
              }
            />
          </SettingRow>
        )}
        <SettingRow
          name={t[
            'com.nexio.appearanceSettings.showLinkedDocInSidebar.title'
          ]()}
          desc={t[
            'com.nexio.appearanceSettings.showLinkedDocInSidebar.description'
          ]()}
        >
          <Switch
            checked={!!appSettings.showLinkedDocInSidebar}
            onChange={checked =>
              updateSettings('showLinkedDocInSidebar', checked)
            }
          />
        </SettingRow>
      </SettingWrapper>

      {BUILD_CONFIG.isElectron ? <MenubarSetting /> : null}
    </>
  );
};
