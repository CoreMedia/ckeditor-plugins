import Element from './element';
import Document from "./document";

/**
 * Type of {@link module:engine/model/element~Element} that is a root of a model tree.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_model_rootelement-RootElement.html">Class RootElement (engine/model/rootelement~RootElement) - CKEditor 5 API docs</a>
 */
export default class RootElement extends Element {
  rootName: string;

  get document(): Document | null;

  constructor(document: Document, name: string, rootName?: string);

  is(type: string, name?: string): boolean;

  toJSON(): string;
}
