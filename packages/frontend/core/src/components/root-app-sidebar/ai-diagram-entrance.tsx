import { IconButton } from '@nexio/component';
import { MenuLinkItem } from '@nexio/core/modules/app-sidebar/views';
import { WorkbenchService } from '@nexio/core/modules/workbench';
import { PlusIcon } from '@blocksuite/icons/rc';
import { useLiveData, useService } from '@toeverything/infra';
import type React from 'react';
import { useCallback } from 'react';

export const AiDiagramIcon = (props: React.SVGProps<SVGSVGElement>) => (
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
    <rect x="3" y="3" width="7" height="6" rx="1.5" />
    <rect x="14" y="3" width="7" height="6" rx="1.5" />
    <rect x="8.5" y="15" width="7" height="6" rx="1.5" />
    <path d="M6.5 9v3.5a1.5 1.5 0 0 0 1.5 1.5h8a1.5 1.5 0 0 0 1.5-1.5V9" />
    <path d="M12 14v1" />
  </svg>
);

export const AiDiagramEntrance = () => {
  const workbench = useService(WorkbenchService).workbench;
  const location = useLiveData(workbench.location$);
  const isActive = location.pathname.startsWith('/ai-diagram');

  const onOpenNew = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      workbench.open('/ai-diagram');
    },
    [workbench]
  );

  return (
    <MenuLinkItem
      data-testid="sidebar-ai-diagram-entrance"
      icon={<AiDiagramIcon />}
      active={isActive}
      to={'/ai-diagram'}
      postfix={
        <IconButton
          size="20"
          onClick={onOpenNew}
          tooltip="AI Diagram Studio (Eraser Architect)"
        >
          <PlusIcon />
        </IconButton>
      }
      postfixDisplay="hover"
    >
      <span>AI Diagram Studio</span>
    </MenuLinkItem>
  );
};
