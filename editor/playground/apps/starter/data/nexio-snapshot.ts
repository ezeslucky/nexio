import { AffineSchemas } from '@blocksuite/nexio/schemas';
import { Schema, Text, type Workspace } from '@blocksuite/nexio/store';
import { ZipTransformer } from '@blocksuite/nexio/widgets/linked-doc';
export async function nexioSnapshot(collection: Workspace, id: string) {
  const doc = collection.createDoc(id);
  doc.load();
  const store = doc.getStore();
  // Add root block and surface block at root level
  const rootId = store.addBlock('affine:page', {
    title: new Text('Nexio Snapshot Test'),
  });
  store.addBlock('affine:surface', {}, rootId);

  const path = '/apps/starter/data/snapshots/affine-default.zip';
  const response = await fetch(path);
  const file = await response.blob();
  const schema = new Schema();
  schema.register(AffineSchemas);
  await ZipTransformer.importDocs(collection, schema, file);
}

nexioSnapshot.id = 'nexio-snapshot';
nexioSnapshot.displayName = 'Nexio Snapshot Test';
nexioSnapshot.description = 'Nexio Snapshot Test';

export const affineSnapshot = nexioSnapshot;
