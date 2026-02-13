import type { MenuItemProps } from '@nexio/component';
import { MenuItem } from '@nexio/component';
import { useI18n } from '@nexio/i18n';
import { ShareIcon } from '@blocksuite/icons/rc';

export const DisablePublicSharing = (props: MenuItemProps) => {
  const t = useI18n();
  return (
    <MenuItem type="danger" prefixIcon={<ShareIcon />} {...props}>
      {t['Disable Public Sharing']()}
    </MenuItem>
  );
};
