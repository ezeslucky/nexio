import { NexioSchemas } from '@canvas/nexio/schemas';
import { replaceIdMiddleware } from '@canvas/nexio/shared/adapters';
import {
  type DocSnapshot,
  Schema,
  Transformer,
  type Workspace,
} from '@canvas/store';

export async function importFromSnapshot(
  collection: Workspace,
  snapshot: DocSnapshot
) {
  const job = new Transformer({
    schema: new Schema().register(NexioSchemas),
    blobCRUD: collection.blobSync,
    docCRUD: {
      create: (id: string) => collection.createDoc(id).getStore({ id }),
      get: (id: string) => collection.getDoc(id)?.getStore({ id }) ?? null,
      delete: (id: string) => collection.removeDoc(id),
    },
    middlewares: [replaceIdMiddleware(collection.idGenerator)],
  });

  return job.snapshotToDoc(snapshot);
}
