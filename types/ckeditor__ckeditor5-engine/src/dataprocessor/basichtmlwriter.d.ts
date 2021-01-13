import HtmlWriter from "./htmlwriter";

/**
 * Basic HTML writer. It uses the native `innerHTML` property for basic conversion
 * from a document fragment to an HTML string.
 *
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_engine_dataprocessor_basichtmlwriter-BasicHtmlWriter.html">Class BasicHtmlWriter (engine/dataprocessor/basichtmlwriter~BasicHtmlWriter) - CKEditor 5 API docs</a>
 */
export default class BasicHtmlWriter implements HtmlWriter {
  /**
   * Returns an HTML string created from the document fragment.
   *
   * @param {DocumentFragment} fragment
   * @returns {String}
   */
  // DevNote: While according to declaration `fragment` is of type DocumentFragment
  // the implementation of `BasicHtmlWriter` accepts `any` as type.
  getHtml(fragment: Node | DocumentFragment): string;
}
