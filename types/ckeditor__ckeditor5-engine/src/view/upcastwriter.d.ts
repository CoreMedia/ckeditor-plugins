import ViewDocument from "./document";
import ViewElement from "./element";

/**
 * View upcast writer. It provides a set of methods used to manipulate non-semantic view trees.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_view_upcastwriter-UpcastWriter.html">Class UpcastWriter (engine/view/upcastwriter~UpcastWriter) - CKEditor 5 API docs</a>
 */
export default class UpcastWriter {
  constructor(document: ViewDocument);

  /**
   * Clones the provided element.
   *
   * @param {ViewElement} element Element to be cloned.
   * @param {boolean} [deep=false] If set to `true` clones element and all its children recursively. When set to `false`,
   * element will be cloned without any children.
   * @returns {ViewElement} Clone of this element.
   */
  clone(element: ViewElement, deep?: boolean): ViewElement;
}
