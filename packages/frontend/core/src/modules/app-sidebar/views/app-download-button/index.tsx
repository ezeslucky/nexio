import { DownloadModal } from '@affine/core/components/download-modal';
import { useCatchEventCallback } from '@affine/core/components/hooks/use-catch-event-hook';
import { track } from '@affine/track';
import { CloseIcon, DownloadIcon } from '@blocksuite/icons/rc';
import clsx from 'clsx';
import { useCallback, useState } from 'react';

import * as styles from './index.css';

export function AppDownloadButton({
  className,
  style,
}: {
  className?: string;
  style?: React.CSSProperties;
}) {
  const [show, setShow] = useState(true);
  const [openModal, setOpenModal] = useState(false);

  const handleClose = useCatchEventCallback(() => {
    setShow(false);
  }, []);

  const handleClick = useCallback(() => {
    track.$.navigationPanel.bottomButtons.downloadApp();
    setOpenModal(true);
  }, []);

  if (!show) {
    return null;
  }
  return (
    <>
      <button
        style={style}
        className={clsx([styles.root, styles.rootPadding, className])}
        onClick={handleClick}
      >
        <div className={clsx([styles.label])}>
          <DownloadIcon className={styles.icon} />
          <span className={styles.ellipsisTextOverflow}>Download App</span>
        </div>
        <div className={styles.closeIcon} onClick={handleClose}>
          <CloseIcon />
        </div>
        <div className={styles.particles} aria-hidden="true"></div>
        <span className={styles.halo} aria-hidden="true"></span>
      </button>
      <DownloadModal open={openModal} onOpenChange={setOpenModal} />
    </>
  );
}
