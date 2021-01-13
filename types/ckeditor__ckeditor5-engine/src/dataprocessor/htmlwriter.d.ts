/**
 * The HTML writer interface.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_dataprocessor_htmlwriter-HtmlWriter.html">Interface HtmlWriter (engine/dataprocessor/htmlwriter~HtmlWriter) - CKEditor 5 API docs</a>
 */
export default interface HtmlWriter {
  /**
   * Returns an HTML string created from the document fragment.
   *
   * @param {DocumentFragment} fragment
   * @returns {String}
   */
  // DevNote: Unlike the documentation/API specification DocumentFragment as
  // well as Node is handed over to this method. Thus, we extend this type
  // definition.
  getHtml(fragment: Node | DocumentFragment): string;
}
