/**
 * View downcast writer.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_downcastwriter-DowncastWriter.html">Class DowncastWriter (engine/view/downcastwriter~DowncastWriter) - CKEditor 5 API docs</a>
 */
import Document from "./document";
import AttributeElement from "./attributeelement";
import ContainerElement from "./ContainerElement";
import RawElement from "./rawelement";
import Element from "./element";
import Range from "./range"
import UIElement from "./uielement";
import Position from "./position";

export default class DowncastWriter {
  constructor(document: Document);

  addClass(className: any, element: any): void;

  breakAttributes(positionOrRange: any): any;

  breakContainer(position: any): any;

  clear(range: any, element: any): void;

  clearClonedElementsGroup(groupName: any): void;

  createAttributeElement(
    name: string,
    attributes: { [attribute: string]: string },
    options?: {
      priority?: number,
      id?: number | string,
    }): AttributeElement;

  createContainerElement(name: any, attributes?: any, options?: {}): ContainerElement;

  createDocumentFragment(children: any): any;

  createEditableElement(name: any, attributes: any): any;

  createEmptyElement(name: any, attributes?: any, options?: {}): any;

  createPositionAfter(item: any): any;

  createPositionAt(itemOrPosition: any, offset: any): any;

  createPositionBefore(item: any): any;

  createRange(start: any, end: any): any;

  createRangeIn(element: Element): Range;

  createRangeOn(item: any): any;

  createRawElement(name: any, attributes?: any, renderFunction?: (document: HTMLElement) => void, options?: {}): RawElement;

  createSelection(selectable: any, placeOrOffset: any, options: any): any;

  createText(data: any): any;

  createUIElement(name: any, attributes?: any, renderFunction?: any, options?: {}): UIElement;

  insert(position: Position, nodes: any): any;

  mergeAttributes(position: any): any;

  mergeContainers(position: any): any;

  move(sourceRange: any, targetPosition: any): any;

  remove(rangeOrItem: any): any;

  removeAttribute(key: any, element: any): void;

  removeClass(className: any, element: any): void;

  removeCustomProperty(key: any, element: any): any;

  removeStyle(property: any, element: any): void;

  rename(newName: any, viewElement: any): any;

  setAttribute(key: any, value: any, element: any): void;

  setCustomProperty(key: any, value: any, element: any): void;

  setSelection(selectable: any, placeOrOffset: any, options: any): void;

  setSelectionFocus(itemOrPosition: any, offset: any): void;

  setStyle(property: any, value: any, element: any): void;

  unwrap(range: any, attribute: any): any;

  wrap(range: any, attribute: any): any;
}

