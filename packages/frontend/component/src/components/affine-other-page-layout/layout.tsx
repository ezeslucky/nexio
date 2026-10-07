import { NexioLogo } from '@affine/component/auth-components';
import { useTheme } from 'next-themes';
import type { ReactNode } from 'react';

import dotBgDark from './assets/dot-bg.dark.png';
import dotBgLight from './assets/dot-bg.light.png';
import * as styles from './index.css';

export const AffineOtherPageLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { resolvedTheme } = useTheme();
  const backgroundImage =
    resolvedTheme === 'dark' && dotBgDark ? dotBgDark : dotBgLight;

  return (
    <div
      className={styles.root}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      {BUILD_CONFIG.isElectron ? (
        <div className={styles.draggableHeader} />
      ) : (
        <div className={styles.topNav}>
          <a href="/" rel="noreferrer" className={styles.affineLogo}>
            <NexioLogo height={28} />
          </a>
        </div>
      )}

      {children}
    </div>
  );
};

