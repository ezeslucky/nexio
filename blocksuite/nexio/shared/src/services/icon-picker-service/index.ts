import type { UniComponent } from '@blocksuite/nexio-shared/types';
import { createIdentifier } from '@blocksuite/global/di';
export enum IconType {
  Emoji = 'emoji',
  NEXIOIcon = 'nexio-icon',
  Blob = 'blob',
}

export type IconData =
  | {
      type: IconType.Emoji;
      unicode: string;
    }
  | {
      type: IconType.NEXIOIcon;
      name: string;
      color: string;
    }
  | {
      type: IconType.Blob;
      blob: Blob;
    };

export interface IconPickerService {
  iconPickerComponent: UniComponent<{ onSelect?: (data?: IconData) => void }>;
}

export const IconPickerServiceIdentifier =
  createIdentifier<IconPickerService>('IconPickerService');
