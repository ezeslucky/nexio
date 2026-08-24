import { Skeleton } from '@nexio/component';
import { NavigationPanelTreeRoot } from '@nexio/core/desktop/components/navigation-panel';
import { NavigationPanelService } from '@nexio/core/modules/navigation-panel';
import { OrganizeService } from '@nexio/core/modules/organize';
import { useI18n } from '@nexio/i18n';
import track from '@nexio/track';
import { AddOrganizeIcon } from '@canvas/icons/rc';
import { useLiveData, useServices } from '@ezeslucky/infra';
import { useCallback, useMemo, useState } from 'react';

import { AddItemPlaceholder } from '../../layouts/add-item-placeholder';
import { CollapsibleSection } from '../../layouts/collapsible-section';
import { NavigationPanelFolderNode } from '../../nodes/folder';
import { FolderCreateTip, FolderRenameDialog } from '../../nodes/folder/dialog';

export const NavigationPanelOrganize = () => {
  const { organizeService, navigationPanelService } = useServices({
    OrganizeService,
    NavigationPanelService,
  });
  const path = useMemo(() => ['organize'], []);
  const [openNewFolderDialog, setOpenNewFolderDialog] = useState(false);

  const t = useI18n();

  const folderTree = organizeService.folderTree;
  const rootFolder = folderTree.rootFolder;

  const folders = useLiveData(rootFolder.sortedChildren$);
  const isLoading = useLiveData(folderTree.isLoading$);

  const handleCreateFolder = useCallback(
    (name: string) => {
      const newFolderId = rootFolder.createFolder(
        name,
        rootFolder.indexAt('before')
      );
      track.$.navigationPanel.organize.createOrganizeItem({ type: 'folder' });
      navigationPanelService.setCollapsed(path, false);
      return newFolderId;
    },
    [navigationPanelService, path, rootFolder]
  );

  return (
    <CollapsibleSection
      path={path}
      title={t['com.nexio.rootAppSidebar.organize']()}
    >
      {/* TODO(@CatsJuice): Organize loading UI */}
      <NavigationPanelTreeRoot placeholder={isLoading ? <Skeleton /> : null}>
        {folders.map(child => (
          <NavigationPanelFolderNode
            key={child.id}
            nodeId={child.id as string}
            parentPath={path}
          />
        ))}
        <AddItemPlaceholder
          icon={<AddOrganizeIcon />}
          data-testid="navigation-panel-bar-add-organize-button"
          label={t['com.nexio.rootAppSidebar.organize.add-folder']()}
          onClick={() => setOpenNewFolderDialog(true)}
        />
      </NavigationPanelTreeRoot>
      <FolderRenameDialog
        open={openNewFolderDialog}
        onConfirm={handleCreateFolder}
        onOpenChange={setOpenNewFolderDialog}
        descRenderer={FolderCreateTip}
      />
    </CollapsibleSection>
  );
};
