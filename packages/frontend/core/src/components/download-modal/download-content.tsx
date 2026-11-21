import { Button } from '@nexio/component/ui/button';
import { notify } from '@nexio/component/ui/notification';
import { CopyIcon, DownloadIcon, OpenInNewIcon } from '@blocksuite/icons/rc';
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

export interface FormatBadge {
  label: string;
  url: string;
  filename: string;
  title?: string;
}

export interface PlatformInfo {
  id: PlatformId;
  name: string;
  category: 'desktop' | 'mobile';
  description: string;
  badges: string[];
  formats: FormatBadge[];
  icon: React.ReactNode;
  downloadLabel: string;
  downloadUrl: string;
  downloadFilename: string;
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
    formats: [
      {
        label: 'EXE',
        url: '/api/download?platform=windows&arch=x64&format=exe',
        filename: 'Nexio-Setup-0.27.5-x64.exe',
        title: 'Download 64-bit Windows EXE installer',
      },
      {
        label: 'MSI',
        url: '/api/download?platform=windows&arch=x64&format=msi',
        filename: 'Nexio-Setup-0.27.5-x64.msi',
        title: 'Download Windows MSI package',
      },
      {
        label: 'x64',
        url: '/api/download?platform=windows&arch=x64&format=exe',
        filename: 'Nexio-Setup-0.27.5-x64.exe',
        title: 'Download standard 64-bit installer',
      },
      {
        label: 'ARM64',
        url: '/api/download?platform=windows&arch=arm64&format=exe',
        filename: 'Nexio-Setup-0.27.5-arm64.exe',
        title: 'Download for Windows on ARM64',
      },
    ],
    icon: <WindowsIcon width={22} height={22} />,
    downloadLabel: 'Download for Windows',
    downloadUrl: '/api/download?platform=windows&arch=x64&format=exe',
    downloadFilename: 'Nexio-Setup-0.27.5-x64.exe',
  },
  {
    id: 'mac',
    name: 'macOS',
    category: 'desktop',
    description: 'macOS 11.0 Big Sur or later',
    badges: ['DMG', 'Apple Silicon (M1/M2/M3)', 'Intel'],
    formats: [
      {
        label: 'DMG',
        url: '/api/download?platform=mac&arch=arm64&format=dmg',
        filename: 'Nexio-0.27.5-arm64.dmg',
        title: 'Download Apple Disk Image',
      },
      {
        label: 'Apple Silicon (M1/M2/M3)',
        url: '/api/download?platform=mac&arch=arm64&format=dmg',
        filename: 'Nexio-0.27.5-arm64.dmg',
        title: 'Download for Apple Silicon (M1/M2/M3/M4)',
      },
      {
        label: 'Intel',
        url: '/api/download?platform=mac&arch=x64&format=dmg',
        filename: 'Nexio-0.27.5-x64.dmg',
        title: 'Download for Intel-based Macs',
      },
    ],
    icon: <AppleIcon width={22} height={22} />,
    downloadLabel: 'Download for Mac',
    downloadUrl: '/api/download?platform=mac&arch=arm64&format=dmg',
    downloadFilename: 'Nexio-0.27.5-arm64.dmg',
  },
  {
    id: 'linux',
    name: 'Linux',
    category: 'desktop',
    description: 'Ubuntu, Debian, Fedora, Arch & AppImage',
    badges: ['AppImage', 'DEB', 'Tar.gz'],
    formats: [
      {
        label: 'AppImage',
        url: '/api/download?platform=linux&format=appimage',
        filename: 'Nexio-0.27.5.AppImage',
        title: 'Download standalone Linux AppImage',
      },
      {
        label: 'DEB',
        url: '/api/download?platform=linux&format=deb',
        filename: 'nexio_0.27.5_amd64.deb',
        title: 'Download Debian / Ubuntu DEB package',
      },
      {
        label: 'Tar.gz',
        url: '/api/download?platform=linux&format=tar.gz',
        filename: 'nexio-0.27.5-linux-x64.tar.gz',
        title: 'Download compressed Linux binary archive',
      },
    ],
    icon: <LinuxIcon width={22} height={22} />,
    downloadLabel: 'Download for Linux',
    downloadUrl: '/api/download?platform=linux&format=appimage',
    downloadFilename: 'Nexio-0.27.5.AppImage',
  },
  {
    id: 'android',
    name: 'Android',
    category: 'mobile',
    description: 'Android 10.0 or higher phones & tablets',
    badges: ['APK', 'Universal', 'arm64-v8a'],
    formats: [
      {
        label: 'APK',
        url: '/api/download?platform=android&format=apk',
        filename: 'Nexio-0.27.5-arm64-v8a.apk',
        title: 'Download Android APK package',
      },
      {
        label: 'Universal',
        url: '/api/download?platform=android&format=universal',
        filename: 'Nexio-0.27.5-universal.apk',
        title: 'Download Universal Android APK',
      },
      {
        label: 'arm64-v8a',
        url: '/api/download?platform=android&arch=arm64&format=apk',
        filename: 'Nexio-0.27.5-arm64-v8a.apk',
        title: 'Download ARM64-v8a optimized APK',
      },
    ],
    icon: <AndroidIcon width={22} height={22} />,
    downloadLabel: 'Download Android APK',
    downloadUrl: '/api/download?platform=android&format=apk',
    downloadFilename: 'Nexio-0.27.5-arm64-v8a.apk',
  },
  {
    id: 'ios',
    name: 'iOS & iPadOS',
    category: 'mobile',
    description: 'iPhone & iPad running iOS 16.0 or higher',
    badges: ['iOS', 'iPadOS', 'TestFlight / App'],
    formats: [
      {
        label: 'iOS',
        url: 'https://testflight.apple.com/',
        filename: 'Nexio for iOS',
        title: 'Install on iPhone',
      },
      {
        label: 'iPadOS',
        url: 'https://testflight.apple.com/',
        filename: 'Nexio for iPadOS',
        title: 'Install on iPad',
      },
      {
        label: 'TestFlight',
        url: 'https://testflight.apple.com/',
        filename: 'Nexio TestFlight Beta',
        title: 'Join TestFlight public beta',
      },
    ],
    icon: <AppleIcon width={22} height={22} />,
    downloadLabel: 'Download for iOS',
    downloadUrl: 'https://testflight.apple.com/',
    downloadFilename: 'Nexio iOS',
  },
];

export function DownloadContent() {
  const [activeCategory, setActiveCategory] = useState<PlatformCategory>('all');
  const [terminalTab, setTerminalTab] = useState<'sh' | 'ps1'>('sh');
  const detected = useMemo(() => detectCurrentPlatform(), []);

  const terminalCommand = useMemo(() => {
    return terminalTab === 'sh'
      ? 'curl -fsSL https://www.technexio.me/ | sh'
      : 'irm https://www.technexio.me/install.ps1 | iex';
  }, [terminalTab]);

  const handleCopyTerminal = useCallback(() => {
    navigator.clipboard
      .writeText(terminalCommand)
      .then(() => {
        notify.success({
          title: 'Copied to Clipboard!',
          message: 'Paste and run in your terminal to install Nexio.',
        });
      })
      .catch(() => {
        notify.warning({
          title: 'Command',
          message: terminalCommand,
        });
      });
  }, [terminalCommand]);

  const detectedPlatform = useMemo(() => {
    return PLATFORMS.find(p => p.id === detected.id) || PLATFORMS[0];
  }, [detected.id]);

  const filteredPlatforms = useMemo(() => {
    if (activeCategory === 'all') {
      return PLATFORMS;
    }
    return PLATFORMS.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const handleDownload = useCallback((url: string, filename: string) => {
    if (url.startsWith('https://testflight.apple.com') || url.includes('github.com/')) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }

    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      notify.success({
        title: 'Download Started',
        message: `Downloading ${filename}...`,
      });
    } catch {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
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
          <div className={styles.detectedBannerRight}>
            <Button
              variant="primary"
              onClick={() =>
                handleDownload(
                  detectedPlatform.downloadUrl,
                  detectedPlatform.downloadFilename
                )
              }
              prefix={<DownloadIcon />}
            >
              {detectedPlatform.downloadLabel}
            </Button>
            {detectedPlatform.formats.length > 0 && (
              <div className={styles.detectedChips}>
                {detectedPlatform.formats.map(f => (
                  <button
                    key={f.label}
                    type="button"
                    title={f.title || `Download ${f.label}`}
                    className={styles.chipButton}
                    onClick={() => handleDownload(f.url, f.filename)}
                  >
                    <DownloadIcon width={10} height={10} />
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>
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
                  {platform.formats.map(f => (
                    <button
                      key={f.label}
                      type="button"
                      title={f.title || `Download ${f.label}`}
                      className={styles.badge}
                      onClick={() => handleDownload(f.url, f.filename)}
                    >
                      <DownloadIcon width={10} height={10} />
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.cardActions}>
              <Button
                variant="secondary"
                onClick={() =>
                  handleDownload(
                    platform.downloadUrl,
                    platform.downloadFilename
                  )
                }
                prefix={<DownloadIcon />}
              >
                Download
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className={styles.terminalCard}>
        <div className={styles.terminalHeader}>
          <div className={styles.terminalTitle}>
            <span>Install via Terminal</span>
          </div>
          <div className={styles.terminalTabs}>
            <button
              type="button"
              className={styles.terminalTab}
              data-active={terminalTab === 'sh'}
              onClick={() => setTerminalTab('sh')}
            >
              macOS / Linux / WSL
            </button>
            <button
              type="button"
              className={styles.terminalTab}
              data-active={terminalTab === 'ps1'}
              onClick={() => setTerminalTab('ps1')}
            >
              Windows PowerShell
            </button>
          </div>
        </div>
        <div className={styles.terminalCodeRow}>
          <code className={styles.terminalCode}>{terminalCommand}</code>
          <Button
            className={styles.terminalCopyBtn}
            variant="secondary"
            prefix={<CopyIcon width={14} height={14} />}
            onClick={handleCopyTerminal}
          >
            Copy
          </Button>
        </div>
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
