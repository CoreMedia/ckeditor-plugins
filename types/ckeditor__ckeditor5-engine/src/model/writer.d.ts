import Text from "./text";
import Element from "./element";
import DocumentFragment from "./documentfragment";
import { Item } from "./item";
import Position, { PositionStickiness } from "./position";
import Node from "./node";

type Offset = number | "end" | "before" | "after";

/**
 * The model can only be modified by using the writer. It should be used whenever you want to create a node, modify
 * child nodes, attributes or text, set the selection's position and its attributes.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_writer-Writer.html">Class Writer (engine/model/writer~Writer) - CKEditor 5 API docs</a>
 */
export default class Writer {
  createText(data: string, attributes?: any): Text;

  createElement(name: string, attributes?: any): Element;

  createDocumentFragment(): DocumentFragment;

  cloneElement(element: Element, deep?: boolean): Element;

  insert(item: Item | DocumentFragment, itemOrPosition: Item | Position, offset?: Offset): void;

  insertText(text: string, attributes: any, itemOrPosition: Item | Position, offset?: Offset): void;

  insertElement(name: string, attributes: any, itemOrPosition: Item | Position, offset?: Offset): void;

  append(item: Item | DocumentFragment, parent: Element | DocumentFragment): void;

  appendText(text: string, attributes: any, parent: Element | DocumentFragment): void;

  appendElement(name: string, attributes: any, parent: Element | DocumentFragment): void;

  merge(position: Position): void;

  createPositionFromPath(root: Element | DocumentFragment, path: number[], stickiness?: PositionStickiness): Position;

  createPositionAt(itemOrPosition: Item | Position, offset?: Offset): Position;

  createPositionAfter(item: Item): Position;

  createPositionBefore(item: Item): Position;

  rename(element: Element, newName: string): void;

  split(position: Position, limitElement: Node): {
    position: Position;
    range: any;
  };

  wrap(range: any, elementOrString: Element | string): void;

  unwrap(element: Element): void;

  setSelectionAttribute(keyOrObjectOrIterable: string | any, value: any): void;

  removeSelectionAttribute(keyOrIterableOfKeys: string | string[]): void;

  overrideSelectionGravity(): string;

  restoreSelectionGravity(uid: string): void;
}
