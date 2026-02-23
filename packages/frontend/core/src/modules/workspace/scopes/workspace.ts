import type { WorkerInitOptions } from '@nexio/nbstore/worker/client';
import { Scope } from '@ezeslucky/infra';

import type { WorkspaceOpenOptions } from '../open-options';

export class WorkspaceScope extends Scope<{
  openOptions: WorkspaceOpenOptions;
  engineWorkerInitOptions: WorkerInitOptions;
}> {}
