import HtmlWriter from "@ckeditor/ckeditor5-engine/src/dataprocessor/htmlwriter";
import BasicHtmlWriter from "@ckeditor/ckeditor5-engine/src/dataprocessor/basichtmlwriter";

const COREMEDIA_RICHTEXT_PREAMBLE = '<?xml version="1.0" encoding="utf-8"?>';
const COREMEDIA_RICHTEXT_NAMESPACE = "http://www.coremedia.com/2003/richtext-1.0";
const XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";

/**
 * This HtmlWriter is responsible for wrapping the given fragment, so that
 * it is identified as CoreMedia RichText 1.0. It adds the required
 * XML-preamble as well as the outer <code>&lt;div&gt;</code> element with
 * default namespace and xlink namespace.
 */
export default class RichTextHtmlWriter extends BasicHtmlWriter {
  getHtml(fragment: Node | DocumentFragment): string {
    return COREMEDIA_RICHTEXT_PREAMBLE + super.getHtml(fragment);
  }
}
