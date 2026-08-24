import { KeymapExtension } from '@canvas/std';

export const fallbackKeymap = KeymapExtension(() => {
  return {
    Tab: ctx => {
      const event = ctx.get('defaultState').event;
      event.stopPropagation();
      event.preventDefault();
    },
    'Shift-Tab': ctx => {
      const event = ctx.get('defaultState').event;
      event.stopPropagation();
      event.preventDefault();
    },
  };
});
