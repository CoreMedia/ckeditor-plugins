import Element from "../view/element";
import Text from "../view/text";
import DocumentFragment from "../view/documentfragment";

/**
 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_viewconsumable-ViewConsumable.html
 */
export default class ViewConsumable {
  add(element: Element | Text | DocumentFragment):void;
}