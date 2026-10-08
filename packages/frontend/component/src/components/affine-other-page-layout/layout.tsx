import { NexioLogo } from '@nexio/component/auth-components';
import { useTheme } from 'next-themes';
import type { ReactNode } from 'react';

import dotBgDark from './assets/dot-bg.dark.png';
import dotBgLight from './assets/dot-bg.light.png';
import { DesktopNavbar } from './desktop-navbar';
import * as styles from './index.css';
import { MobileNavbar } from './mobile-navbar';

export const NexioOtherPageLayout = ({
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
          <a href="/" rel="noreferrer" className={styles.nexioLogo}>
            <NexioLogo height={28} />
          </a>

          <DesktopNavbar />

          <div className={styles.hideInSmallScreen} style={{ width: 100 }} />
          <MobileNavbar />
        </div>
      )}

      {children}
    </div>
  );
};


// Backwards compatibility alias
export const AffineOtherPageLayout = NexioOtherPageLayout;
