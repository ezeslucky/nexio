import { KanbanCard } from './card.js';
import { KanbanCell } from './cell.js';
import { KanbanGroup } from './group.js';
import { KanbanHeader } from './header.js';

export function pcEffects() {
  customElements.define('nexio-data-view-kanban-card', KanbanCard);
  customElements.define('nexio-data-view-kanban-cell', KanbanCell);
  customElements.define('nexio-data-view-kanban-group', KanbanGroup);
  customElements.define('nexio-data-view-kanban-header', KanbanHeader);
}
