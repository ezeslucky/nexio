import { OverlayModal } from '@nexio/component';
import { useI18n } from '@nexio/i18n';

export const StarNEXIOModal = ({
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
      topImage={
        <video
          width={400}
          height={300}
          style={{ objectFit: 'cover' }}
          src={'/static/githubStar.mp4'}
          autoPlay
          loop
        />
      }
      title={t['com.nexio.star-nexio.title']()}
      onOpenChange={setOpen}
      description={t['com.nexio.star-nexio.description']()}
      cancelText={t['com.nexio.star-nexio.cancel']()}
      to={BUILD_CONFIG.githubUrl}
      confirmButtonOptions={{
        variant: 'primary',
      }}
      confirmText={t['com.nexio.star-nexio.confirm']()}
      external
    />
  );
};
