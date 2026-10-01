import { OverlayModal } from '@affine/component';
import { useI18n } from '@affine/i18n';

import { NexioStarPreview } from './nexio-star-preview';

export const StarNexioModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const t = useI18n();

  return (
    <OverlayModal
      open={open}
      topImage={<NexioStarPreview />}
      title={t['com.affine.star-affine.title']()}
      onOpenChange={setOpen}
      description={t['com.affine.star-affine.description']()}
      cancelText={t['com.affine.star-affine.cancel']()}
      to={'https://github.com/ezeslucky/nexio'}
      confirmButtonOptions={{
        variant: 'primary',
      }}
      confirmText={t['com.affine.star-affine.confirm']()}
      external
    />
  );
};

export const StarAFFiNEModal = StarNexioModal;
