import { createIdentifier } from '@ezeslucky/infra';

export interface PopupWindowProvider {
  
  open(url: string): void;
}

export const PopupWindowProvider = createIdentifier<PopupWindowProvider>(
  'PopupWindowProvider'
);
