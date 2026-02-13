import type { WorkspaceServerService } from '@nexio/core/modules/cloud';
import { workspaceQuotaQuery } from '@nexio/graphql';
import { Store } from '@toeverything/infra';

export class WorkspaceQuotaStore extends Store {
  constructor(private readonly workspaceServerService: WorkspaceServerService) {
    super();
  }

  async fetchWorkspaceQuota(workspaceId: string, signal?: AbortSignal) {
    if (!this.workspaceServerService.server) {
      throw new Error('No Server');
    }
    const data = await this.workspaceServerService.server.gql({
      query: workspaceQuotaQuery,
      variables: {
        id: workspaceId,
      },
      context: {
        signal,
      },
    });
    return data.workspace.quota;
  }
}
