import DocumentFragment from "../view/documentfragment";
import HtmlWriter from "./htmlwriter";
import Node from "../view/node";

/**
 * Basic HTML writer. It uses the native `innerHTML` property for basic conversion
 * from a document fragment to an HTML string.
 */
export default class BasicHtmlWriter implements HtmlWriter {
  getHtml(fragment: Node | DocumentFragment): string;
}
