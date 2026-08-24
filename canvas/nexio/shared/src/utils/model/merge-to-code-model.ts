import type { BlockModel } from '@canvas/store';
import { Text } from '@canvas/store';

export function mergeToCodeModel(models: BlockModel[]) {
  if (models.length === 0) {
    return null;
  }
  const doc = models[0].store;

  const parent = doc.getParent(models[0]);
  if (!parent) {
    return null;
  }
  const index = parent.children.indexOf(models[0]);
  const text = models
    .map(model => {
      if (model.text instanceof Text) {
        return model.text.toString();
      }
      return null;
    })
    .filter(Boolean)
    .join('\n');
  models.forEach(model => doc.deleteBlock(model));

  const id = doc.addBlock(
    'nexio:code',
    { text: new Text(text) },
    parent,
    index
  );
  return id;
}
