// corresponding to `formatText` command
import { TableModelFlavour } from '@canvas/nexio-model';

export const FORMAT_TEXT_SUPPORT_FLAVOURS = [
  'nexio:paragraph',
  'nexio:list',
  'nexio:code',
];
// corresponding to `formatBlock` command
export const FORMAT_BLOCK_SUPPORT_FLAVOURS = [
  'nexio:paragraph',
  'nexio:list',
  'nexio:code',
];
// corresponding to `formatNative` command
export const FORMAT_NATIVE_SUPPORT_FLAVOURS = [
  'nexio:database',
  TableModelFlavour,
];
