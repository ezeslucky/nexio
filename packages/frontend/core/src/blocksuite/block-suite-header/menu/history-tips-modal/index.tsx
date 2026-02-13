import { OverlayModal } from '@nexio/component';
import { useEnableCloud } from '@nexio/core/components/hooks/nexio/use-enable-cloud';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { useI18n } from '@nexio/i18n';
import { useService } from '@toeverything/infra';
import { useCallback } from 'react';

import TopSvg from './top-svg';

export const HistoryTipsModal = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const t = useI18n();
  const currentWorkspace = useService(WorkspaceService).workspace;
  const confirmEnableCloud = useEnableCloud();

  const handleConfirm = useCallback(() => {
    setOpen(false);
    confirmEnableCloud(currentWorkspace);
  }, [confirmEnableCloud, currentWorkspace, setOpen]);

  return (
    <OverlayModal
      open={open}
      topImage={<TopSvg />}
      title={t['com.nexio.history-vision.tips-modal.title']()}
      onOpenChange={setOpen}
      description={t['com.nexio.history-vision.tips-modal.description']()}
      cancelText={t['com.nexio.history-vision.tips-modal.cancel']()}
      confirmButtonOptions={{
        variant: 'primary',
      }}
      onConfirm={handleConfirm}
      confirmText={t['com.nexio.history-vision.tips-modal.confirm']()}
    />
  );
};
