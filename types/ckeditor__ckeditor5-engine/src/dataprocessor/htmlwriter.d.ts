import DocumentFragment from "../view/documentfragment";
import Node from "../view/node";

/**
 * The HTML writer interface.
 */
export default interface HtmlWriter {
  /*
   * DevNote getHtml:
   * According to documentation it only accepts DocumentFragments.
   * But HtmlDataProcessor uses it in a way, that it requires to accept
   * Nodes as well as DocumentFragments.
   */
  /**
   * Returns an HTML string created from the document fragment.
   *
   * @param {DocumentFragment} fragment
   * @returns {String}
   */
  getHtml(fragment: Node | DocumentFragment): string;
}
