import type { Text } from '@blocksuite/store';
import {
  BlockModel,
  BlockSchemaExtension,
  defineBlockSchema,
} from '@blocksuite/store';

import type { TextAlign } from '../../consts';
import type { BlockMeta } from '../../utils/types';

// `toggle` type has been deprecated, do not use it
export type ListType = 'bulleted' | 'numbered' | 'todo' | 'toggle';

export type ListProps = {
  type: ListType;
  text: Text;
  textAlign?: TextAlign;
  checked: boolean;
  collapsed: boolean;
  order: number | null;
  comments?: Record<string, boolean>;
} & BlockMeta;

export const ListBlockSchema = defineBlockSchema({
  flavour: 'nexio:list',
  props: internal =>
    ({
      type: 'bulleted',
      text: internal.Text(),
      textAlign: undefined,
      checked: false,
      collapsed: false,

      // number type only for numbered list
      order: null,
      comments: undefined,
      'meta:createdAt': undefined,
      'meta:createdBy': undefined,
      'meta:updatedAt': undefined,
      'meta:updatedBy': undefined,
    }) as ListProps,
  metadata: {
    version: 1,
    role: 'content',
    parent: [
      'nexio:note',
      'nexio:database',
      'nexio:list',
      'nexio:paragraph',
      'nexio:edgeless-text',
      'nexio:callout',
    ],
  },
  toModel: () => new ListBlockModel(),
});

export const ListBlockSchemaExtension = BlockSchemaExtension(ListBlockSchema);

export class ListBlockModel extends BlockModel<ListProps> {}
