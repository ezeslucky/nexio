import type { OpSchema } from '@ezeslucky/infra/op';

export interface WorkerOps extends OpSchema {
  renderWorkspaceProfile: [Uint8Array[], { name?: string; avatar?: string }];
}
