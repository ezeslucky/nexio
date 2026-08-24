import { NexioSchemas } from '@canvas/nexio/schemas';
import { Schema, Text, type Workspace } from '@canvas/nexio/store';
import { ZipTransformer } from '@canvas/nexio/widgets/linked-doc';
export async function nexioSnapshot(collection: Workspace, id: string) {
  const doc = collection.createDoc(id);
  doc.load();
  const store = doc.getStore();
  // Add root block and surface block at root level
  const rootId = store.addBlock('nexio:page', {
    title: new Text('Nexio Snapshot Test'),
  });
  store.addBlock('nexio:surface', {}, rootId);

  const path = '/apps/starter/data/snapshots/nexio-default.zip';
  const response = await fetch(path);
  const file = await response.blob();
  const schema = new Schema();
  schema.register(NexioSchemas);
  await ZipTransformer.importDocs(collection, schema, file);
}

nexioSnapshot.id = 'nexio-snapshot';
nexioSnapshot.displayName = 'Nexio Snapshot Test';
nexioSnapshot.description = 'Nexio Snapshot Test';
