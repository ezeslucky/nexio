import type { ConfirmModalProps, MenuItemProps } from '@nexio/component';
import { ConfirmModal, MenuItem } from '@nexio/component';
import { useI18n } from '@nexio/i18n';
import { DeleteIcon } from '@blocksuite/icons/rc';

export const MoveToTrash = (props: MenuItemProps) => {
  const t = useI18n();

  return (
    <MenuItem prefixIcon={<DeleteIcon />} type="danger" {...props}>
      {t['com.nexio.moveToTrash.title']()}
    </MenuItem>
  );
};

const MoveToTrashConfirm = ({
  titles,
  ...confirmModalProps
}: {
  titles: string[];
} & ConfirmModalProps) => {
  const t = useI18n();
  const multiple = titles.length > 1;
  const title = multiple
    ? t['com.nexio.moveToTrash.confirmModal.title.multiple']({
        number: titles.length.toString(),
      })
    : t['com.nexio.moveToTrash.confirmModal.title']();
  const description = multiple
    ? t['com.nexio.moveToTrash.confirmModal.description.multiple']({
        number: titles.length.toString(),
      })
    : t['com.nexio.moveToTrash.confirmModal.description']({
        title: titles[0] || t['Untitled'](),
      });
  return (
    <ConfirmModal
      title={title}
      description={description}
      cancelText={t['com.nexio.confirmModal.button.cancel']()}
      confirmText={t.Delete()}
      confirmButtonOptions={{
        ['data-testid' as string]: 'confirm-delete-page',
        variant: 'error',
      }}
      {...confirmModalProps}
    />
  );
};

MoveToTrash.ConfirmModal = MoveToTrashConfirm;
