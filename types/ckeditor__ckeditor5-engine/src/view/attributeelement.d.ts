import Element from './element';
import Document from "./document";

/**
 * Attribute elements are used to represent formatting elements in the view (think – `<b>`, `<span style="font-size: 2em">`, etc.).
 * Most often they are created when downcasting model text attributes.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_attributeelement-AttributeElement.html">Class AttributeElement (engine/view/attributeelement~AttributeElement) - CKEditor 5 API docs</a>
 */
export default class AttributeElement extends Element {
  constructor(document: Document, name: string, attrs: any, children: any);

  get priority(): number;

  get id(): string | number;

  getElementsWithSameId(): Set<AttributeElement>;
}
