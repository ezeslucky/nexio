import { LifeCycleWatcher } from '@canvas/nexio/std';
import type { FrameworkProvider } from '@ezeslucky/infra';

import { buildAIPanelConfig } from '../ai-panel';
import { setupSpaceAIEntry } from '../entries/space/setup-space';
import { NexioAIPanelWidget } from '../widgets/ai-panel/ai-panel';

export function getAIPageRootWatcher(framework: FrameworkProvider) {
  class AIPageRootWatcher extends LifeCycleWatcher {
    static override key = 'ai-page-root-watcher';

    override mounted() {
      super.mounted();
      const { view } = this.std;
      view.viewUpdated.subscribe(payload => {
        if (payload.type !== 'widget' || payload.method !== 'add') {
          return;
        }
        const component = payload.view;
        if (component instanceof NexioAIPanelWidget) {
          component.style.width = '630px';
          component.config = buildAIPanelConfig(component, framework);
          setupSpaceAIEntry(component);
        }
      });
    }
  }
  return AIPageRootWatcher;
}
