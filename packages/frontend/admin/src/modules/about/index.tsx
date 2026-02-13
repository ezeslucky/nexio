import { ScrollArea } from '@nexio/admin/components/ui/scroll-area';

import { Header } from '../header';
import { AboutNEXIO } from './about';

export function ConfigPage() {
  return (
    <div className=" h-screen flex-1 space-y-1 flex-col flex">
      <Header title="Server" />
      <ScrollArea>
        <AboutNEXIO />
      </ScrollArea>
    </div>
  );
}

export { ConfigPage as Component };
