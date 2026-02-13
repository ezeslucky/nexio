import { useI18n } from '@nexio/i18n';

import { SettingGroup } from '../group';
import { RowLayout } from '../row.layout';
import { DeleteAccount } from './delete-account';
import { hotTag } from './index.css';

export const OthersGroup = () => {
  const t = useI18n();

  return (
    <SettingGroup title={t['com.nexio.mobile.setting.others.title']()}>
      <RowLayout
        label={
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {t['com.nexio.mobile.setting.others.discord']()}
            <div className={hotTag}>Hot</div>
          </div>
        }
        href="https://discord.com/invite/whd5mjYqVw"
      />
      <RowLayout
        label={t['com.nexio.mobile.setting.others.github']()}
        href="https://github.com/ezeslucky/nexio"
      />

      <RowLayout
        label={t['com.nexio.mobile.setting.others.website']()}
        href="https://nexio.pro/"
      />

      <RowLayout
        label={t['com.nexio.mobile.setting.others.privacy']()}
        href="https://nexio.pro/privacy"
      />

      <RowLayout
        label={t['com.nexio.mobile.setting.others.terms']()}
        href="https://nexio.pro/terms"
      />
      <DeleteAccount />
    </SettingGroup>
  );
};
