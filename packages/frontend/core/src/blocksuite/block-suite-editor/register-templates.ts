import { builtInTemplates as builtInEdgelessTemplates } from '@nexio/templates/edgeless';
import { builtInTemplates as builtInStickersTemplates } from '@nexio/templates/stickers';
import {
  EdgelessTemplatePanel,
  type TemplateManager,
} from '@blocksuite/nexio/gfx/template';

export function registerTemplates() {
  EdgelessTemplatePanel.templates.extend(
    builtInStickersTemplates as TemplateManager
  );
  EdgelessTemplatePanel.templates.extend(
    builtInEdgelessTemplates as TemplateManager
  );
}
