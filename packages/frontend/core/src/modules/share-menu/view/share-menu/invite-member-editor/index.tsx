import { Input } from '@nexio/component';
import { useI18n } from '@nexio/i18n';
import { SearchIcon } from '@canvas/icons/rc';
import { cssVar } from '@ezeslucky/theme';

import * as styles from './styles.css';

export const InviteInput = ({ onFocus }: { onFocus: () => void }) => {
  const t = useI18n();

  return (
    <Input
      preFix={<SearchIcon className={styles.iconStyle} />}
      className={styles.inputStyle}
      onFocus={onFocus}
      inputStyle={{
        paddingLeft: '0',
        fontSize: cssVar('fontSm'),
      }}
      placeholder={t['com.nexio.share-menu.invite-editor.placeholder']()}
    />
  );
};
