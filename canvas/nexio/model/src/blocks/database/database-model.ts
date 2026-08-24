import type { Text } from '@canvas/store';
import {
  BlockModel,
  BlockSchemaExtension,
  defineBlockSchema,
} from '@canvas/store';

import type {
  ColumnDataType,
  SerializedCells,
  ViewBasicDataType,
} from './types.js';

export type DatabaseBlockProps = {
  views: ViewBasicDataType[];
  title: Text;
  cells: SerializedCells;
  columns: Array<ColumnDataType>;
  comments?: Record<string, boolean>;
};

export class DatabaseBlockModel extends BlockModel<DatabaseBlockProps> {}

export const DatabaseBlockSchema = defineBlockSchema({
  flavour: 'nexio:database',
  props: (internal): DatabaseBlockProps => ({
    views: [],
    title: internal.Text(),
    cells: Object.create(null),
    columns: [],
    comments: undefined,
  }),
  metadata: {
    role: 'hub',
    version: 3,
    parent: ['nexio:note'],
    children: ['nexio:paragraph', 'nexio:list'],
  },
  toModel: () => new DatabaseBlockModel(),
});

export const DatabaseBlockSchemaExtension =
  BlockSchemaExtension(DatabaseBlockSchema);
