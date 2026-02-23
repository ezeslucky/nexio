import '@nexio/core/bootstrap/browser';

import { broadcastChannelStorages } from '@nexio/nbstore/broadcast-channel';
import { cloudStorages } from '@nexio/nbstore/cloud';
import { idbStorages } from '@nexio/nbstore/idb';
import { idbV1Storages } from '@nexio/nbstore/idb/v1';
import {
  StoreManagerConsumer,
  type WorkerManagerOps,
} from '@nexio/nbstore/worker/consumer';
import { type MessageCommunicapable, OpConsumer } from '@ezeslucky/infra/op';

const consumer = new StoreManagerConsumer([
  ...idbStorages,
  ...idbV1Storages,
  ...broadcastChannelStorages,
  ...cloudStorages,
]);

if ('onconnect' in globalThis) {
  // if in shared worker

  (globalThis as any).onconnect = (event: MessageEvent) => {
    const port = event.ports[0];
    consumer.bindConsumer(new OpConsumer<WorkerManagerOps>(port));
  };
} else {
  // if in worker
  consumer.bindConsumer(
    new OpConsumer<WorkerManagerOps>(globalThis as MessageCommunicapable)
  );
}
