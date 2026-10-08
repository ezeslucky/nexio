import { useI18n } from '@nexio/i18n';

import { SettingGroup } from '../group';
import { RowLayout } from '../row.layout';

export const AboutGroup = () => {
  const t = useI18n();

  return (
    <SettingGroup title={t['com.affine.mobile.setting.about.title']()}>
      <RowLayout label={t['com.affine.mobile.setting.about.appVersion']()}>
        {BUILD_CONFIG.isIOS
          ? hiddenVersionVariant(BUILD_CONFIG.appVersion)
          : BUILD_CONFIG.appVersion}
      </RowLayout>

      <RowLayout label={t['com.affine.mobile.setting.about.editorVersion']()}>
        {BUILD_CONFIG.isIOS
          ? hiddenVersionVariant(BUILD_CONFIG.editorVersion)
          : BUILD_CONFIG.editorVersion}
      </RowLayout>

      <RowLayout
        label="Download Nexio App"
        description="Available for Mac, Windows, Linux, Android, and iOS"
        href="/download"
      />
    </SettingGroup>
  );
};

// 0.23.0-beta.1 -> 0.23.0
function hiddenVersionVariant(version: string) {
  return version.replace(/(\d+\.\d+\.\d+)(.*)/, '$1');
}
