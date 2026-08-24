import { useI18n } from '@nexio/i18n';
import { ViewLayersIcon } from '@canvas/icons/rc';

import { NavigationPanelEmptySection } from '../../layouts/empty-section';

export const RootEmpty = ({
  onClickCreate,
}: {
  onClickCreate?: () => void;
}) => {
  const t = useI18n();

  return (
    <NavigationPanelEmptySection
      icon={ViewLayersIcon}
      message={t['com.nexio.collections.empty.message']()}
      messageTestId="slider-bar-collection-empty-message"
      actionText={t['com.nexio.collections.empty.new-collection-button']()}
      onActionClick={onClickCreate}
    />
  );
};
