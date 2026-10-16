import { IconButton } from '@nexio/component';
import { MenuLinkItem } from '@nexio/core/modules/app-sidebar/views';
import { WorkbenchService } from '@nexio/core/modules/workbench';
import { PlusIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import type React from 'react';
import { useCallback } from 'react';

export const LogAuditorIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ userSelect: 'none', flexShrink: 0 }}
    {...props}
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

export const LogAuditorEntrance = () => {
  const workbench = useService(WorkbenchService).workbench;
  const location = useLiveData(workbench.location$);
  const isActive = location.pathname.startsWith('/log-auditor');

  const onOpenNew = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      workbench.open('/log-auditor');
    },
    [workbench]
  );

  return (
    <MenuLinkItem
      data-testid="sidebar-log-auditor-entrance"
      icon={<LogAuditorIcon />}
      active={isActive}
      to={'/log-auditor'}
      postfix={
        <IconButton
          size="small"
          onClick={onOpenNew}
          tooltip="AI Logging Sentinel (Codebase Auditor)"
        >
          <PlusIcon />
        </IconButton>
      }
      postfixDisplay="hover"
    >
      <span>Log Auditor</span>
    </MenuLinkItem>
  );
};
