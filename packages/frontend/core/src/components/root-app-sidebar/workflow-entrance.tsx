import { IconButton } from '@nexio/component';
import { MenuLinkItem } from '@nexio/core/modules/app-sidebar/views';
import { WorkbenchService } from '@nexio/core/modules/workbench';
import { useI18n } from '@nexio/i18n';
import { PlusIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import type React from 'react';
import { useCallback } from 'react';

export const WorkflowIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <rect x="3" y="3" width="6" height="6" rx="1.5" />
    <rect x="15" y="3" width="6" height="6" rx="1.5" />
    <rect x="9" y="15" width="6" height="6" rx="1.5" />
    <path d="M6 9v3a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9" />
    <path d="M12 13v2" />
  </svg>
);

export const WorkflowEntrance = () => {
  const t = useI18n();
  const workbench = useService(WorkbenchService).workbench;
  const location = useLiveData(workbench.location$);
  const isActive = location.pathname.startsWith('/workflow');

  const onOpenNew = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      workbench.open('/workflow');
    },
    [workbench]
  );

  const label = t['Workflow'] ? t['Workflow']() : 'Workflow';

  return (
    <MenuLinkItem
      data-testid="sidebar-workflow-entrance"
      icon={<WorkflowIcon />}
      active={isActive}
      to={'/workflow'}
      postfix={
        <IconButton
          size="small"
          onClick={onOpenNew}
          tooltip="Workflow Studio (n8n Automations)"
        >
          <PlusIcon />
        </IconButton>
      }
      postfixDisplay="hover"
    >
      <span>{label}</span>
    </MenuLinkItem>
  );
};
