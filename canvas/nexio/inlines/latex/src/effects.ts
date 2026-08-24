import { LatexEditorMenu } from './latex-node/latex-editor-menu';
import { LatexEditorUnit } from './latex-node/latex-editor-unit';
import { NexioLatexNode } from './latex-node/latex-node';

export function effects() {
  customElements.define('latex-editor-menu', LatexEditorMenu);
  customElements.define('latex-editor-unit', LatexEditorUnit);
  customElements.define('nexio-latex-node', NexioLatexNode);
}

declare global {
  interface HTMLElementTagNameMap {
    'nexio-latex-node': NexioLatexNode;
    'latex-editor-unit': LatexEditorUnit;
    'latex-editor-menu': LatexEditorMenu;
  }
}
