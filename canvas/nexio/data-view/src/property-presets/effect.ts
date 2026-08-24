import { CheckboxCell } from './checkbox/cell-renderer.js';
import { DateCell } from './date/cell-renderer.js';
import { ImageCell } from './image/cell-renderer.js';
import { MultiSelectCell } from './multi-select/cell-renderer.js';
import { NumberCell } from './number/cell-renderer.js';
import { ProgressCell } from './progress/cell-renderer.js';
import { SelectCell } from './select/cell-renderer.js';
import { TextCell } from './text/cell-renderer.js';

export function propertyPresetsEffects() {
  customElements.define('nexio-database-checkbox-cell', CheckboxCell);
  customElements.define('nexio-database-date-cell', DateCell);
  customElements.define('nexio-database-image-cell', ImageCell);
  customElements.define('nexio-database-multi-select-cell', MultiSelectCell);
  customElements.define('nexio-database-number-cell', NumberCell);
  customElements.define('nexio-database-progress-cell', ProgressCell);
  customElements.define('nexio-database-select-cell', SelectCell);
  customElements.define('nexio-database-text-cell', TextCell);
}
