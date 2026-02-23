import type { Framework } from '@ezeslucky/infra';

import { LifecycleService } from './service/lifecycle';

export {
  ApplicationFocused,
  ApplicationStarted,
  LifecycleService,
} from './service/lifecycle';

export function configureLifecycleModule(framework: Framework) {
  framework.service(LifecycleService);
}
