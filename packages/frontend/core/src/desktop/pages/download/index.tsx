import { NexioOtherPageLayout } from '@nexio/component/affine-other-page-layout';
import { DownloadContent } from '@nexio/core/components/download-modal/download-content';

import * as styles from './styles.css';

export const Component = () => {
  return (
    <NexioOtherPageLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Download Nexio</h1>
          <p className={styles.subtitle}>
            Available for desktop and mobile. Seamlessly create, collaborate, and think freely.
          </p>
        </div>
        <div className={styles.contentWrapper}>
          <DownloadContent />
        </div>
      </div>
    </NexioOtherPageLayout>
  );
};
