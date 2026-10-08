import { useI18n } from '@nexio/i18n';

import { SettingGroup } from '../group';
import { RowLayout } from '../row.layout';

export const OthersGroup = () => {
  const t = useI18n();

  return (
    <SettingGroup title={t['com.affine.mobile.setting.others.title']()}>
      <RowLayout
        label={t['com.affine.mobile.setting.others.discord']()}
        href="https://discord.com/invite/whd5mjYqVw"
      />
      <RowLayout
        label={t['com.affine.mobile.setting.others.github']()}
        href="https://github.com/ezeslucky/nexio"
      />

      <RowLayout
        label={t['com.affine.mobile.setting.others.website']()}
        href="/"
      />

      <RowLayout
        label={t['com.affine.mobile.setting.others.privacy']()}
        href="#"
      />

      <RowLayout
        label={t['com.affine.mobile.setting.others.terms']()}
        href="#"
      />
    </SettingGroup>
  );
};
