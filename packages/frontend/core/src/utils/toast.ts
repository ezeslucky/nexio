import type { ToastOptions } from '@nexio/component';
import { toast as basicToast } from '@nexio/component';

export const toast = (message: string, options?: ToastOptions) => {
  const modal = document.querySelector<HTMLDivElement>('[role=presentation]');
  if (modal && !(modal instanceof HTMLDivElement)) {
    throw new Error('modal should be div');
  }
  return basicToast(message, {
    portal: modal || document.body,
    ...options,
  });
};

declare global {
  // global Events
  interface WindowEventMap {
    'nexio-toast:emit': CustomEvent<{
      message: string;
    }>;
  }
}
