import {
  NEXIO_PAGE_DRAGGING_AREA_WIDGET,
  NexioPageDraggingAreaWidget,
} from './index';

export function effects() {
  customElements.define(
    NEXIO_PAGE_DRAGGING_AREA_WIDGET,
    NexioPageDraggingAreaWidget
  );
}
