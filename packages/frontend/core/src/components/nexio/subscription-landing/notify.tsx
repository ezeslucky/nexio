import { type Notification, notify } from '@nexio/component';
import { useI18n } from '@nexio/i18n';
import clsx from 'clsx';
import { useCallback, useRef } from 'react';

import {
  actionButton,
  cancelButton,
  confirmButton,
  notifyHeader,
} from './notify.css';

export const useDowngradeNotify = () => {
  const t = useI18n();
  const prevNotifyIdRef = useRef<string | number | null>(null);

  return useCallback(
    (link: string) => {
      prevNotifyIdRef.current && notify.dismiss(prevNotifyIdRef.current);

      const actions: Notification['actions'] = [
        {
          key: 'later',
          label: t['com.nexio.payment.downgraded-notify.later'](),
          onClick: () => {},
          buttonProps: {
            className: clsx(actionButton, cancelButton),
          },
        },
        {
          key: 'ok',
          label: BUILD_CONFIG.isElectron
            ? t['com.nexio.payment.downgraded-notify.ok-client']()
            : t['com.nexio.payment.downgraded-notify.ok-web'](),
          onClick: () => {
            window.open(link, '_blank', 'noreferrer');
          },
          buttonProps: {
            className: clsx(actionButton, confirmButton),
          },
        },
      ];

      const id = notify(
        {
          title: (
            <span className={notifyHeader}>
              {t['com.nexio.payment.downgraded-notify.title']()}
            </span>
          ),
          message: t['com.nexio.payment.downgraded-notify.content'](),
          alignMessage: 'title',
          icon: null,
          actions,
        },
        { duration: 24 * 60 * 60 * 1000 }
      );
      prevNotifyIdRef.current = id;
    },
    [t]
  );
};
