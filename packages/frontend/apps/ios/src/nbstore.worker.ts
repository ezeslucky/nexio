import './setup-worker';

import { MessagePortAuthProvider } from '@nexio/mobile-shared/auth/channel';
import { installAuthRequestProxy } from '@nexio/mobile-shared/auth/request';
import { broadcastChannelStorages } from '@nexio/nbstore/broadcast-channel';
import {
  cloudStorages,
  configureSocketAuthMethod,
} from '@nexio/nbstore/cloud';
import { idbStoragesIndexerOnly } from '@nexio/nbstore/idb';
import {
  bindNativeDBApis,
  type NativeDBApis,
  sqliteStorages,
} from '@nexio/nbstore/sqlite';
import {
  StoreManagerConsumer,
  type WorkerManagerOps,
} from '@nexio/nbstore/worker/consumer';
import { type MessageCommunicapable, OpConsumer } from '@toeverything/infra/op';
import { AsyncCall } from 'async-call-rpc';

const authProvider = new MessagePortAuthProvider();
installAuthRequestProxy(authProvider);

configureSocketAuthMethod((endpoint, cb) => {
  authProvider
    .getValidAccessToken(endpoint)
    .then(token => cb(token ? { token, tokenType: 'jwt' } : {}))
    .catch(() => cb({ error: 'AUTH_SESSION_TEMPORARILY_UNAVAILABLE' }));
});

globalThis.addEventListener('message', e => {
  if (e.data.type === 'auth-access-token-channel') {
    authProvider.setPort(e.ports[0] as MessagePort);
    return;
  }

  if (e.data.type === 'native-db-api-channel') {
    const port = e.ports[0] as MessagePort;
    const rpc = AsyncCall<NativeDBApis>(
      {},
      {
        channel: {
          on(listener) {
            const f = (e: MessageEvent<any>) => {
              listener(e.data);
            };
            port.addEventListener('message', f);
            return () => {
              port.removeEventListener('message', f);
            };
          },
          send(data) {
            port.postMessage(data);
          },
        },
      }
    );
    bindNativeDBApis(rpc);
    port.start();
  }
});

const consumer = new OpConsumer<WorkerManagerOps>(
  globalThis as MessageCommunicapable
);

const storeManager = new StoreManagerConsumer([
  ...idbStoragesIndexerOnly,
  ...sqliteStorages,
  ...broadcastChannelStorages,
  ...cloudStorages,
]);

storeManager.bindConsumer(consumer);
