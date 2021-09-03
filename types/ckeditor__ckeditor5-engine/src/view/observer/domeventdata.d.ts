/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_observer_domeventdata-DomEventData.html">Class DomEventData (engine/view/observer/domeventdata~DomEventData) - CKEditor 5 API docs</a>
 */
import View from "../view";
import Document from "../document";

export default class DomEventData {
  readonly view: View;
  readonly document: Document;
  readonly domEvent: Event;
  target: Element;

  constructor(view: View, domEvent: Event, additionalData?: Record<string, unknown>);

  preventDefault(): void;

  stopPropagation(): void;
}
