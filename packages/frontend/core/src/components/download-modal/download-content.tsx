import { Button } from '@affine/component/ui/button';
import { DownloadIcon, OpenInNewIcon } from '@blocksuite/icons/rc';
import { useCallback, useMemo, useState } from 'react';

import {
  AndroidIcon,
  AppleIcon,
  LinuxIcon,
  WindowsIcon,
} from './platform-icons';
import * as styles from './styles.css';

export type PlatformCategory = 'all' | 'desktop' | 'mobile';
export type PlatformId = 'mac' | 'windows' | 'linux' | 'android' | 'ios';

export interface PlatformInfo {
  id: PlatformId;
  name: string;
  category: 'desktop' | 'mobile';
  description: string;
  badges: string[];
  icon: React.ReactNode;
  downloadLabel: string;
  downloadUrl: string;
  secondaryUrl?: string;
  secondaryLabel?: string;
}

const GITHUB_RELEASES_URL = 'https://github.com/ezeslucky/nexio/releases';

export function detectCurrentPlatform(): {
  id: PlatformId | 'unknown';
  name: string;
} {
  if (typeof window === 'undefined') {
    return { id: 'unknown', name: 'Unknown' };
  }
  const ua = window.navigator.userAgent.toLowerCase();
  if (/android/i.test(ua)) {
    return { id: 'android', name: 'Android' };
  }
  if (/iphone|ipad|ipod/i.test(ua)) {
    return { id: 'ios', name: 'iOS' };
  }
  if (/macintosh|mac os x/i.test(ua)) {
    return { id: 'mac', name: 'macOS' };
  }
  if (/win32|win64|windows|wow32|wow64/i.test(ua)) {
    return { id: 'windows', name: 'Windows' };
  }
  if (/linux/i.test(ua)) {
    return { id: 'linux', name: 'Linux' };
  }
  return { id: 'unknown', name: 'Unknown' };
}

export const PLATFORMS: PlatformInfo[] = [
  {
    id: 'windows',
    name: 'Windows',
    category: 'desktop',
    description: 'Windows 10 & 11 (64-bit / ARM64)',
    badges: ['EXE', 'MSI', 'x64', 'ARM64'],
    icon: <WindowsIcon width={22} height={22} />,
    downloadLabel: 'Download for Windows',
    downloadUrl: GITHUB_RELEASES_URL,
  },
  {
    id: 'mac',
    name: 'macOS',
    category: 'desktop',
    description: 'macOS 11.0 Big Sur or later',
    badges: ['DMG', 'Apple Silicon (M1/M2/M3)', 'Intel'],
    icon: <AppleIcon width={22} height={22} />,
    downloadLabel: 'Download for Mac',
    downloadUrl: GITHUB_RELEASES_URL,
  },
  {
    id: 'linux',
    name: 'Linux',
    category: 'desktop',
    description: 'Ubuntu, Debian, Fedora, Arch & AppImage',
    badges: ['AppImage', 'DEB', 'Tar.gz'],
    icon: <LinuxIcon width={22} height={22} />,
    downloadLabel: 'Download for Linux',
    downloadUrl: GITHUB_RELEASES_URL,
  },
  {
    id: 'android',
    name: 'Android',
    category: 'mobile',
    description: 'Android 10.0 or higher phones & tablets',
    badges: ['APK', 'Universal', 'arm64-v8a'],
    icon: <AndroidIcon width={22} height={22} />,
    downloadLabel: 'Download Android APK',
    downloadUrl: GITHUB_RELEASES_URL,
  },
  {
    id: 'ios',
    name: 'iOS & iPadOS',
    category: 'mobile',
    description: 'iPhone & iPad running iOS 16.0 or higher',
    badges: ['iOS', 'iPadOS', 'TestFlight / App'],
    icon: <AppleIcon width={22} height={22} />,
    downloadLabel: 'Download for iOS',
    downloadUrl: GITHUB_RELEASES_URL,
  },
];

export function DownloadContent() {
  const [activeCategory, setActiveCategory] = useState<PlatformCategory>('all');
  const detected = useMemo(() => detectCurrentPlatform(), []);

  const detectedPlatform = useMemo(() => {
    return PLATFORMS.find(p => p.id === detected.id);
  }, [detected.id]);

  const filteredPlatforms = useMemo(() => {
    if (activeCategory === 'all') {
      return PLATFORMS;
    }
    return PLATFORMS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const handleDownload = useCallback((url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <div className={styles.modalWrapper}>
      {detectedPlatform && (
        <div className={styles.detectedBanner}>
          <div className={styles.detectedBannerLeft}>
            <div className={styles.detectedIcon}>{detectedPlatform.icon}</div>
            <div>
              <div className={styles.detectedTextTitle}>
                Recommended for your system: {detectedPlatform.name}
              </div>
              <div className={styles.detectedTextDesc}>
                {detectedPlatform.description}
              </div>
            </div>
          </div>
          <Button
            variant="primary"
            onClick={() => handleDownload(detectedPlatform.downloadUrl)}
            prefix={<DownloadIcon />}
          >
            {detectedPlatform.downloadLabel}
          </Button>
        </div>
      )}

      <div className={styles.tabsWrapper}>
        <button
          type="button"
          className={styles.tabButton}
          data-active={activeCategory === 'all'}
          onClick={() => setActiveCategory('all')}
        >
          All Platforms
        </button>
        <button
          type="button"
          className={styles.tabButton}
          data-active={activeCategory === 'desktop'}
          onClick={() => setActiveCategory('desktop')}
        >
          Desktop (Mac, Windows, Linux)
        </button>
        <button
          type="button"
          className={styles.tabButton}
          data-active={activeCategory === 'mobile'}
          onClick={() => setActiveCategory('mobile')}
        >
          Mobile (Android, iOS)
        </button>
      </div>

      <div className={styles.platformGrid}>
        {filteredPlatforms.map(platform => (
          <div key={platform.id} className={styles.platformCard}>
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>{platform.icon}</div>
              <div className={styles.cardInfo}>
                <div className={styles.cardTitle}>{platform.name}</div>
                <div className={styles.cardSubtitle}>
                  {platform.description}
                </div>
                <div className={styles.badgeList}>
                  {platform.badges.map(b => (
                    <span key={b} className={styles.badge}>
                      {b}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.cardActions}>
              <Button
                variant="secondary"
                onClick={() => handleDownload(platform.downloadUrl)}
                prefix={<DownloadIcon />}
              >
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.footerCard}>
        <div className={styles.footerText}>
          Looking for source code, checksums, or previous versions?
        </div>
        <a
          href={GITHUB_RELEASES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.footerLink}
        >
          GitHub Releases
          <OpenInNewIcon />
        </a>
      </div>
    </div>
  );
}
