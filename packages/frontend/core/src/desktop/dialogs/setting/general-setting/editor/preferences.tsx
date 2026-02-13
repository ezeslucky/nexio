import { Button } from '@nexio/component';
import {
  SettingRow,
  SettingWrapper,
} from '@nexio/component/setting-components';
import { useI18n } from '@nexio/i18n';

export const Preferences = () => {
  const t = useI18n();
  return (
    <SettingWrapper
      title={t['com.nexio.settings.editorSettings.preferences']()}
    >
      <SettingRow
        name={t[
          'com.nexio.settings.editorSettings.preferences.export.title'
        ]()}
        desc={t[
          'com.nexio.settings.editorSettings.preferences.export.description'
        ]()}
      >
        <Button>Export</Button>
      </SettingRow>
      <SettingRow
        name={t[
          'com.nexio.settings.editorSettings.preferences.import.title'
        ]()}
        desc={t[
          'com.nexio.settings.editorSettings.preferences.import.description'
        ]()}
      >
        <Button>Import</Button>
      </SettingRow>
    </SettingWrapper>
  );
};
