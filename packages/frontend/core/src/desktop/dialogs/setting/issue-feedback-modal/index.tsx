import { OverlayModal } from '@affine/component';
import { useI18n } from '@affine/i18n';

import { NexioIssuePreview } from './nexio-issue-preview';

export const IssueFeedbackModal = ({
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
      topImage={<NexioIssuePreview />}
      title={t['com.affine.issue-feedback.title']()}
      onOpenChange={setOpen}
      description={t['com.affine.issue-feedback.description']()}
      cancelText={t['com.affine.issue-feedback.cancel']()}
      to={'https://github.com/ezeslucky/nexio/issues/new/choose'}
      confirmText={t['com.affine.issue-feedback.confirm']()}
      confirmButtonOptions={{
        variant: 'primary',
      }}
      external
    />
  );
};
