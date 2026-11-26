import { Tooltip } from '@nexio/component';
import { WorkbenchService } from '@nexio/core/modules/workbench';
import { useLiveData, useServices } from '@toeverything/infra';
import clsx from 'clsx';
import { memo, useCallback, useEffect, useState } from 'react';

import { GlobalSearchModal } from '../../desktop/pages/workspace/cross-features/global-search-modal';
import { NotificationsDrawer } from '../../desktop/pages/workspace/cross-features/notifications-drawer';
import {
  badge,
  divider,
  switcherContainer,
  switcherItem,
  switcherItemActive,
} from './module-switcher.css';

interface ModuleConfig {
  id: string;
  name: string;
  path: string;
  icon: (active: boolean) => React.ReactNode;
  badge?: boolean;
}

const MODULES: ModuleConfig[] = [
  {
    id: 'docs',
    name: 'Documents & Notes',
    path: '/all',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    ),
  },
  {
    id: 'tracker',
    name: 'Project Tracker & Issues',
    path: '/tracker',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    id: 'channels',
    name: 'Team Channels & Chat',
    path: '/channels',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
      </svg>
    ),
  },
  {
    id: 'office',
    name: 'Virtual Office & Rooms',
    path: '/office',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path d="M3 21h18M3 7v14M21 7v14M9 3h6v18H9zM9 7h6M9 11h6M9 15h6" />
      </svg>
    ),
  },
  {
    id: 'calendar',
    name: 'Calendar & Scheduling',
    path: '/calendar',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: 'crm',
    name: 'CRM & ATS Pipelines',
    path: '/crm',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </svg>
    ),
  },
  {
    id: 'chat',
    name: 'Nexio Intelligence (AI)',
    path: '/chat',
    icon: (active: boolean) => (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
      </svg>
    ),
  },
];

export const ModuleSwitcher = memo(() => {
  const { workbenchService } = useServices({
    WorkbenchService,
  });
  const workbench = workbenchService.workbench;
  const currentPath = useLiveData(
    workbench.location$.selector(location => location.pathname)
  );

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  // Global Ctrl+K / Cmd+K shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleNavigate = useCallback(
    (path: string) => {
      workbench.open(path);
    },
    [workbench]
  );

  const isActivityActive = currentPath === '/activity';

  return (
    <>
      <div className={switcherContainer} role="tablist" aria-label="Workspace Modules">
        {/* Core Modules */}
        {MODULES.map(mod => {
          const isActive =
            currentPath === mod.path ||
            (mod.path === '/all' && currentPath === '/') ||
            (mod.path !== '/all' && currentPath?.startsWith(mod.path));

          return (
            <Tooltip key={mod.id} content={mod.name} side="bottom">
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                className={clsx(switcherItem, isActive && switcherItemActive)}
                onClick={() => handleNavigate(mod.path)}
                data-testid={`module-tab-${mod.id}`}
              >
                {mod.icon(isActive)}
                {mod.badge && !isActive && <span className={badge} />}
              </button>
            </Tooltip>
          );
        })}

        {/* Divider */}
        <div className={divider} />

        {/* Global Search Button */}
        <Tooltip content="Global Search (Ctrl+K)" side="bottom">
          <button
            type="button"
            className={switcherItem}
            onClick={() => setIsSearchOpen(true)}
            data-testid="cross-feature-search-button"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </Tooltip>

        {/* Notifications Button */}
        <Tooltip content={unreadCount > 0 ? `${unreadCount} unread notifications` : 'Notifications'} side="bottom">
          <button
            type="button"
            className={switcherItem}
            onClick={() => setIsNotificationsOpen(true)}
            data-testid="cross-feature-notifications-button"
            style={{ position: 'relative' }}
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {unreadCount > 0 && <span className={badge} />}
          </button>
        </Tooltip>

        {/* Activity Feed Button */}
        <Tooltip content="Activity Feed" side="bottom">
          <button
            type="button"
            role="tab"
            aria-selected={isActivityActive}
            className={clsx(switcherItem, isActivityActive && switcherItemActive)}
            onClick={() => handleNavigate('/activity')}
            data-testid="cross-feature-activity-button"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
          </button>
        </Tooltip>
      </div>

      {/* Global Search Command Palette Modal */}
      <GlobalSearchModal
        open={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      {/* Notifications Drawer Modal */}
      <NotificationsDrawer
        open={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        onUpdateUnread={setUnreadCount}
      />
    </>
  );
});

ModuleSwitcher.displayName = 'ModuleSwitcher';
