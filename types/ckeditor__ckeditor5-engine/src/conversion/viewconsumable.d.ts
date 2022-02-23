import Element from "../view/element";
import Text from "../view/text";
import DocumentFragment from "../view/documentfragment";
import { Item } from "../view/item";

/**
 * https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_conversion_viewconsumable-ViewConsumable.html
 */
export default class ViewConsumable {
  add(element: Element | Text | DocumentFragment): void;

  test(item: Item, consumables?: ViewConsumables): boolean;

  consume(item: Item, consumables?: ViewConsumables): boolean;

  revert(item: Item, consumables?: ViewConsumables): boolean;
}

export type ViewConsumables = {
  attributes?: Array<string> | string;
  classes?: Array<string> | string;
  name?: boolean;
  styles?: Array<string> | string;
}
