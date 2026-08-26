import type { DocProps } from '@nexio/core/canvas/initialization';
import type { DocMode } from '@canvas/nexio/model';

export interface DocCreateOptions {
  id?: string;
  title?: string;
  primaryMode?: DocMode;
  skipInit?: boolean;
  docProps?: DocProps;
  isTemplate?: boolean;
}
