import { ExplorerNavigation } from '@nexio/core/components/explorer/header/navigation';
import { Header } from '@nexio/core/components/pure/header';

export const AllTagHeader = () => {
  return <Header left={<ExplorerNavigation active={'tags'} />} />;
};
