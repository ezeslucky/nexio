import type { useI18n } from '@nexio/i18n';
import { track } from '@nexio/track';
import { SettingsIcon } from '@blocksuite/icons/rc';
import { appSettingAtom } from '@toeverything/infra';
import type { createStore } from 'jotai';
import type { useTheme } from 'next-themes';

import type { EditorSettingService } from '../modules/editor-setting';
import { registerNexioCommand } from './registry';

export function registerNexioSettingsCommands({
  t,
  store,
  theme,
  editorSettingService,
}: {
  t: ReturnType<typeof useI18n>;
  store: ReturnType<typeof createStore>;
  theme: ReturnType<typeof useTheme>;
  editorSettingService: EditorSettingService;
}) {
  const unsubs: Array<() => void> = [];
  const updateSettings = editorSettingService.editorSetting.set.bind(
    editorSettingService.editorSetting
  );
  const settings$ = editorSettingService.editorSetting.settings$;

  // color modes
  unsubs.push(
    registerNexioCommand({
      id: 'nexio:change-color-mode-to-auto',
      label: `${t['com.nexio.cmdk.nexio.color-mode.to']()} ${t[
        'com.nexio.themeSettings.system'
      ]()}`,
      category: 'nexio:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'system',
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'theme',
          value: 'system',
        });
        theme.setTheme('system');
      },
    })
  );
  unsubs.push(
    registerNexioCommand({
      id: 'nexio:change-color-mode-to-dark',
      label: `${t['com.nexio.cmdk.nexio.color-mode.to']()} ${t[
        'com.nexio.themeSettings.dark'
      ]()}`,
      category: 'nexio:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'dark',
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'theme',
          value: 'dark',
        });
        theme.setTheme('dark');
      },
    })
  );

  unsubs.push(
    registerNexioCommand({
      id: 'nexio:change-color-mode-to-light',
      label: `${t['com.nexio.cmdk.nexio.color-mode.to']()} ${t[
        'com.nexio.themeSettings.light'
      ]()}`,
      category: 'nexio:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => theme.theme !== 'light',
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'theme',
          value: 'light',
        });

        theme.setTheme('light');
      },
    })
  );

  // Font styles
  unsubs.push(
    registerNexioCommand({
      id: 'nexio:change-font-style-to-sans',
      label: `${t['com.nexio.cmdk.nexio.font-style.to']()} ${t[
        'com.nexio.appearanceSettings.fontStyle.sans'
      ]()}`,
      category: 'nexio:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => settings$.value.fontFamily !== 'Sans',
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'fontStyle',
          value: 'Sans',
        });

        updateSettings('fontFamily', 'Sans');
      },
    })
  );

  unsubs.push(
    registerNexioCommand({
      id: 'nexio:change-font-style-to-serif',
      label: `${t['com.nexio.cmdk.nexio.font-style.to']()} ${t[
        'com.nexio.appearanceSettings.fontStyle.serif'
      ]()}`,
      category: 'nexio:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => settings$.value.fontFamily !== 'Serif',
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'fontStyle',
          value: 'Serif',
        });

        updateSettings('fontFamily', 'Serif');
      },
    })
  );

  unsubs.push(
    registerNexioCommand({
      id: 'nexio:change-font-style-to-mono',
      label: `${t['com.nexio.cmdk.nexio.font-style.to']()} ${t[
        'com.nexio.appearanceSettings.fontStyle.mono'
      ]()}`,
      category: 'nexio:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => settings$.value.fontFamily !== 'Mono',
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'fontStyle',
          value: 'Mono',
        });

        updateSettings('fontFamily', 'Mono');
      },
    })
  );

  // Layout Style
  unsubs.push(
    registerNexioCommand({
      id: `nexio:change-client-border-style`,
      label: () => `${t['com.nexio.cmdk.nexio.client-border-style.to']()} ${t[
        store.get(appSettingAtom).clientBorder
          ? 'com.nexio.cmdk.nexio.switch-state.off'
          : 'com.nexio.cmdk.nexio.switch-state.on'
      ]()}
        `,
      category: 'nexio:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => BUILD_CONFIG.isElectron,
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'clientBorder',
          value: store.get(appSettingAtom).clientBorder ? 'off' : 'on',
        });
        store.set(appSettingAtom, prev => ({
          ...prev,
          clientBorder: !prev.clientBorder,
        }));
      },
    })
  );

  unsubs.push(
    registerNexioCommand({
      id: `nexio:change-full-width-layout`,
      label: () =>
        `${t[
          settings$.value.fullWidthLayout
            ? 'com.nexio.cmdk.nexio.default-page-width-layout.standard'
            : 'com.nexio.cmdk.nexio.default-page-width-layout.full-width'
        ]()}`,
      category: 'nexio:settings',
      icon: <SettingsIcon />,
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'fullWidthLayout',
          value: settings$.value.fullWidthLayout ? 'off' : 'on',
        });
        updateSettings('fullWidthLayout', !settings$.value.fullWidthLayout);
      },
    })
  );

  unsubs.push(
    registerNexioCommand({
      id: `nexio:change-noise-background-on-the-sidebar`,
      label: () =>
        `${t[
          'com.nexio.cmdk.nexio.noise-background-on-the-sidebar.to'
        ]()} ${t[
          store.get(appSettingAtom).enableNoisyBackground
            ? 'com.nexio.cmdk.nexio.switch-state.off'
            : 'com.nexio.cmdk.nexio.switch-state.on'
        ]()}`,
      category: 'nexio:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () => BUILD_CONFIG.isElectron,
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'enableNoisyBackground',
          value: store.get(appSettingAtom).enableNoisyBackground ? 'off' : 'on',
        });

        store.set(appSettingAtom, prev => ({
          ...prev,
          enableNoisyBackground: !prev.enableNoisyBackground,
        }));
      },
    })
  );

  unsubs.push(
    registerNexioCommand({
      id: `nexio:change-translucent-ui-on-the-sidebar`,
      label: () =>
        `${t['com.nexio.cmdk.nexio.translucent-ui-on-the-sidebar.to']()} ${t[
          store.get(appSettingAtom).enableBlurBackground
            ? 'com.nexio.cmdk.nexio.switch-state.off'
            : 'com.nexio.cmdk.nexio.switch-state.on'
        ]()}`,
      category: 'nexio:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () =>
        BUILD_CONFIG.isElectron && environment.isMacOs,
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'enableBlurBackground',
          value: store.get(appSettingAtom).enableBlurBackground ? 'off' : 'on',
        });
        store.set(appSettingAtom, prev => ({
          ...prev,
          enableBlurBackground: !prev.enableBlurBackground,
        }));
      },
    })
  );

  return () => {
    unsubs.forEach(unsub => unsub());
  };
}
