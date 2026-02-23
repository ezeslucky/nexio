import { NavigationPanelTreeRoot } from '@nexio/core/desktop/components/navigation-panel';
import { NavigationPanelService } from '@nexio/core/modules/navigation-panel';
import { TagService } from '@nexio/core/modules/tag';
import { useI18n } from '@nexio/i18n';
import { track } from '@nexio/track';
import { AddTagIcon } from '@blocksuite/icons/rc';
import { useLiveData, useServices } from '@ezeslucky/infra';
import { useCallback, useMemo, useState } from 'react';

import { AddItemPlaceholder } from '../../layouts/add-item-placeholder';
import { CollapsibleSection } from '../../layouts/collapsible-section';
import { NavigationPanelTagNode } from '../../nodes/tag';
import { TagRenameDialog } from '../../nodes/tag/dialog';

export const TagDesc = ({ input }: { input: string }) => {
  const t = useI18n();

  return input
    ? t['com.nexio.m.explorer.tag.new-tip-not-empty']({ value: input })
    : t['com.nexio.m.explorer.tag.new-tip-empty']();
};

export const NavigationPanelTags = () => {
  const { tagService, navigationPanelService } = useServices({
    TagService,
    NavigationPanelService,
  });
  const path = useMemo(() => ['tags'], []);
  const tags = useLiveData(tagService.tagList.tags$);
  const [showNewTagDialog, setShowNewTagDialog] = useState(false);

  const t = useI18n();

  const handleNewTag = useCallback(
    (name: string, color: string) => {
      setShowNewTagDialog(false);
      tagService.tagList.createTag(name, color);
      track.$.navigationPanel.organize.createOrganizeItem({ type: 'tag' });
      navigationPanelService.setCollapsed(path, false);
    },
    [navigationPanelService, path, tagService]
  );

  return (
    <CollapsibleSection
      path={path}
      title={t['com.nexio.rootAppSidebar.tags']()}
    >
      <NavigationPanelTreeRoot>
        {tags.map(tag => (
          <NavigationPanelTagNode
            key={tag.id}
            tagId={tag.id}
            parentPath={path}
          />
        ))}
        <AddItemPlaceholder
          icon={<AddTagIcon />}
          data-testid="navigation-panel-add-tag-button"
          onClick={() => setShowNewTagDialog(true)}
          label={t[
            'com.nexio.rootAppSidebar.explorer.tag-section-add-tooltip'
          ]()}
        />
        <TagRenameDialog
          open={showNewTagDialog}
          onOpenChange={setShowNewTagDialog}
          onConfirm={handleNewTag}
          enableAnimation
          descRenderer={TagDesc}
        />
      </NavigationPanelTreeRoot>
    </CollapsibleSection>
  );
};
