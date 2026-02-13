import type { DocProps } from '@nexio/core/blocksuite/initialization';
import type { DocMode } from '@blocksuite/nexio/model';

export interface DocCreateOptions {
  id?: string;
  title?: string;
  primaryMode?: DocMode;
  skipInit?: boolean;
  docProps?: DocProps;
  isTemplate?: boolean;
}
