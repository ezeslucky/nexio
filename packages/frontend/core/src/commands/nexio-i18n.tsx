import type { I18n } from '@nexio/core/modules/i18n';
import type { useI18n } from '@nexio/i18n';
import { track } from '@nexio/track';
import { SettingsIcon } from '@blocksuite/icons/rc';

import { registerNexioCommand } from './registry';

export function registerNexioLanguageCommands({
  i18n,
  t,
}: {
  i18n: I18n;
  t: ReturnType<typeof useI18n>;
}) {
  // Display Language
  const disposables = i18n.languageList.map(language => {
    return registerNexioCommand({
      id: `nexio:change-display-language-to-${language.name}`,
      label: `${t['com.nexio.cmdk.nexio.display-language.to']()} ${
        language.originalName
      }`,
      category: 'nexio:settings',
      icon: <SettingsIcon />,
      preconditionStrategy: () =>
        i18n.currentLanguage$.value.key !== language.key,
      run() {
        track.$.cmdk.settings.changeAppSetting({
          key: 'language',
          value: language.name,
        });

        i18n.changeLanguage(language.key);
      },
    });
  });

  return () => {
    disposables.forEach(dispose => dispose());
  };
}
