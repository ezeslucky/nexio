import type { TransformerMiddleware } from '@canvas/store';

export const CODE_BLOCK_WRAP_KEY = 'codeBlockWrap';

export const codeBlockWrapMiddleware = (
  wrap: boolean
): TransformerMiddleware => {
  return ({ adapterConfigs }) => {
    adapterConfigs.set(CODE_BLOCK_WRAP_KEY, String(wrap));
  };
};
