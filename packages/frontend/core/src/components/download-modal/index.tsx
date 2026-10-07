import { Modal } from '@affine/component';
import type { ModalProps } from '@affine/component';

import { DownloadContent } from './download-content';

export interface DownloadModalProps extends Pick<ModalProps, 'open' | 'onOpenChange'> {}

export function DownloadModal({ open, onOpenChange }: DownloadModalProps) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title="Download Nexio"
      description="Experience the best of Nexio on desktop and mobile"
      width={720}
    >
      <DownloadContent />
    </Modal>
  );
}

export { DownloadContent, PLATFORMS } from './download-content';
