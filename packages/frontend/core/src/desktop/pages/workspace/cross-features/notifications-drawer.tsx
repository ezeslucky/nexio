import { Modal } from '@nexio/component';
import { WorkbenchService } from '@nexio/core/modules/workbench';
import { WorkspaceService } from '@nexio/core/modules/workspace';
import { useService } from '@toeverything/infra';
import { useCallback, useEffect, useState } from 'react';

import { CrossFeatureService } from './cross-feature-service';
import type { WorkspaceNotification } from './types';

interface NotificationsDrawerProps {
  open: boolean;
  onClose: () => void;
  onUpdateUnread?: (count: number) => void;
}

const MODULE_ICONS: Record<string, string> = {
  tracker: '☑️',
  docs: '📄',
  chat: '💬',
  office: '🚪',
};

export const NotificationsDrawer = ({
  open,
  onClose,
  onUpdateUnread,
}: NotificationsDrawerProps) => {
  const workspaceService = useService(WorkspaceService);
  const workbenchService = useService(WorkbenchService);
  const workspaceId = workspaceService.workspace?.id || 'default';

  const [notifications, setNotifications] = useState<WorkspaceNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filterUnread, setFilterUnread] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const data = await CrossFeatureService.getNotifications(workspaceId);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      onUpdateUnread?.(data.unreadCount);
    } catch (err) {
      console.warn('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [workspaceId, onUpdateUnread]);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open, fetchNotifications]);

  const handleMarkAsRead = async (notif: WorkspaceNotification) => {
    if (!notif.isRead) {
      try {
        await CrossFeatureService.markNotificationRead(workspaceId, notif.id);
        setNotifications(prev =>
          prev.map(n => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        const newCount = Math.max(0, unreadCount - 1);
        setUnreadCount(newCount);
        onUpdateUnread?.(newCount);
      } catch (err) {
        console.warn(err);
      }
    }
    if (notif.targetUrl) {
      onClose();
      workbenchService.workbench.open(notif.targetUrl);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await CrossFeatureService.markAllNotificationsRead(workspaceId);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
      onUpdateUnread?.(0);
    } catch (err) {
      console.warn(err);
    }
  };

  const displayedList = filterUnread
    ? notifications.filter(n => !n.isRead)
    : notifications;

  return (
    <Modal open={open} onOpenChange={isOpen => !isOpen && onClose()} width={520}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '75vh',
          background: 'var(--affine-background-primary-color, #09090b)',
          color: 'var(--affine-text-primary-color)',
          borderRadius: 12,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px 20px',
            borderBottom: '1px solid var(--affine-border-color, #27272a)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>🔔</span>
            <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0 }}>
              Notifications
            </h2>
            {unreadCount > 0 && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 10,
                  background: 'rgba(59, 130, 246, 0.2)',
                  color: 'var(--affine-primary-color, #3b82f6)',
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--affine-primary-color, #3b82f6)',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Mark all as read
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--affine-text-secondary-color)',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Filter Toggle */}
        <div
          style={{
            display: 'flex',
            gap: 8,
            padding: '8px 20px',
            background: 'var(--affine-background-secondary-color, #18181b)',
            borderBottom: '1px solid var(--affine-border-color, #27272a)',
          }}
        >
          <button
            type="button"
            onClick={() => setFilterUnread(false)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              background: !filterUnread ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: !filterUnread ? 'var(--affine-primary-color, #3b82f6)' : 'var(--affine-text-secondary-color)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            All ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterUnread(true)}
            style={{
              padding: '4px 10px',
              borderRadius: 6,
              border: 'none',
              background: filterUnread ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
              color: filterUnread ? 'var(--affine-primary-color, #3b82f6)' : 'var(--affine-text-secondary-color)',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Unread ({unreadCount})
          </button>
        </div>

        {/* Notifications List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '8px 12px',
            maxHeight: 380,
          }}
        >
          {loading && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--affine-text-secondary-color)', fontSize: 13 }}>
              Loading notifications...
            </div>
          )}

          {!loading && displayedList.length === 0 && (
            <div style={{ padding: '36px 20px', textAlign: 'center', color: 'var(--affine-text-secondary-color)', fontSize: 13 }}>
              {filterUnread ? 'No unread notifications.' : 'No notifications yet.'}
            </div>
          )}

          {!loading &&
            displayedList.map(n => {
              const icon = MODULE_ICONS[n.module] || '🔔';
              return (
                <div
                  key={n.id}
                  onClick={() => handleMarkAsRead(n)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 8,
                    background: !n.isRead ? 'rgba(59, 130, 246, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                  }}
                >
                  <span style={{ fontSize: 18, marginTop: 2 }}>{icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: !n.isRead ? 700 : 600 }}>
                        {n.title}
                      </span>
                      {!n.isRead && (
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: 'var(--affine-primary-color, #3b82f6)',
                          }}
                        />
                      )}
                    </div>
                    <p
                      style={{
                        margin: '0 0 4px 0',
                        fontSize: 12,
                        color: 'var(--affine-text-secondary-color)',
                        lineHeight: 1.4,
                      }}
                    >
                      {n.body}
                    </p>
                    <span style={{ fontSize: 11, color: 'var(--affine-text-secondary-color)', opacity: 0.7 }}>
                      {n.actorName} • {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </Modal>
  );
};
