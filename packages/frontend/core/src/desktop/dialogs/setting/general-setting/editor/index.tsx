import { SettingHeader } from '@nexio/component/setting-components';
import { useI18n } from '@nexio/i18n';

import { Edgeless } from './edgeless';
import { General } from './general';
import { Page } from './page';

export const EditorSettings = () => {
  const t = useI18n();

  return (
    <>
      <SettingHeader
        title={t['com.nexio.settings.editorSettings.title']()}
        subtitle={t['com.nexio.settings.editorSettings.subtitle']()}
      />
      <General />
      <Page />
      <Edgeless />

      {/* // TODO(@EYHN): implement export and import
       <Preferences /> */}
    </>
  );
};
