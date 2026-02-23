import { ServerDeploymentType } from '@nexio/graphql';
import { Service } from '@ezeslucky/infra';

import type { Server } from '../entities/server';
import type { ServersService } from './servers';

export class DefaultServerService extends Service {
  readonly server: Server;

  constructor(private readonly serversService: ServersService) {
    super();

    // global server is always nexio-cloud
    const server = this.serversService.server$('nexio-cloud').value;
    if (!server) {
      throw new Error('No server found');
    }
    this.server = server;
  }

  async waitForSelfhostedServerConfig() {
    if (this.server.config$.value.type === ServerDeploymentType.Selfhosted) {
      await this.server.waitForConfigRevalidation();
    }
  }
}
