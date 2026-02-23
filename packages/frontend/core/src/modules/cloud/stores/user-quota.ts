import { quotaQuery } from '@nexio/graphql';
import { Store } from '@ezeslucky/infra';

import type { GraphQLService } from '../services/graphql';

export class UserQuotaStore extends Store {
  constructor(private readonly graphqlService: GraphQLService) {
    super();
  }

  async fetchUserQuota(abortSignal?: AbortSignal) {
    const data = await this.graphqlService.gql({
      query: quotaQuery,
      context: {
        signal: abortSignal,
      },
    });

    if (!data.currentUser) {
      throw new Error('No logged in');
    }

    return {
      userId: data.currentUser.id,
      quota: data.currentUser.quota,
      used: data.currentUser.quotaUsage.storageQuota,
    };
  }
}
