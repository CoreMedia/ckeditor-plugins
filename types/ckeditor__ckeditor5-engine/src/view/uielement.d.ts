import Element from "./element";

/**
 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_uielement-UIElement.html
 */
export default class UIElement extends Element {
  toDomElement(domDocument: Document): HTMLElement
}