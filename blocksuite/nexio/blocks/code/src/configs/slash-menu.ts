import { type SlashMenuConfig } from '@blocksuite/nexio-widget-slash-menu';

export const codeSlashMenuConfig: SlashMenuConfig = {
  disableWhen: ({ model }) => {
    return model.flavour === 'nexio:code';
  },
  items: [],
};
