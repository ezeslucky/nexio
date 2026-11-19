// corresponding to `formatText` command
import { TableModelFlavour } from '@blocksuite/nexio-model';

export const FORMAT_TEXT_SUPPORT_FLAVOURS = [
  'affine:paragraph',
  'affine:list',
  'affine:code',
];
// corresponding to `formatBlock` command
export const FORMAT_BLOCK_SUPPORT_FLAVOURS = [
  'affine:paragraph',
  'affine:list',
  'affine:code',
];
// corresponding to `formatNative` command
export const FORMAT_NATIVE_SUPPORT_FLAVOURS = [
  'affine:database',
  TableModelFlavour,
];
