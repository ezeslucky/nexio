import { ExplorerDisplayMenuButton } from '@nexio/core/components/explorer/display-menu';
import { ExplorerNavigation } from '@nexio/core/components/explorer/header/navigation';
import type { ExplorerDisplayPreference } from '@nexio/core/components/explorer/types';
import { Header } from '@nexio/core/components/pure/header';

export const TagDetailHeader = ({
  displayPreference,
  onDisplayPreferenceChange,
}: {
  displayPreference: ExplorerDisplayPreference;
  onDisplayPreferenceChange: (
    displayPreference: ExplorerDisplayPreference
  ) => void;
}) => {
  return (
    <Header
      left={<ExplorerNavigation active={'tags'} />}
      right={
        <ExplorerDisplayMenuButton
          displayPreference={displayPreference}
          onDisplayPreferenceChange={onDisplayPreferenceChange}
        />
      }
    />
  );
};
