import HtmlFilter from "@coremedia/ckeditor5-dataprocessor-support/HtmlFilter";
import { COREMEDIA_RICHTEXT_NAMESPACE_URI } from "./Constants";

/**
 * This class is responsible for the `toData` processing.
 */
export default class ToDataProcessor {
  readonly #toDataFilter: HtmlFilter;

  /**
   * Filter to use for `toData` processing.
   * @param toDataFilter - filter
   */
  constructor(toDataFilter: HtmlFilter) {
    this.#toDataFilter = toDataFilter;
  }

  /**
   * Internal `toData` transformation, especially meant for testing purpose.
   *
   * @param fromView - the fragment created from view
   * @param targetDocument - the target document, which will get the elements added
   * and will be transformed according to the rules
   * @returns the transformed CoreMedia RichText XML
   */
  toData(fromView: Node | DocumentFragment, targetDocument?: Document): Document {
    const document: Document = targetDocument || ToDataProcessor.createCoreMediaRichTextDocument();
    document.documentElement.appendChild(fromView);
    this.#toDataFilter.applyTo(document.documentElement);
    return document;
  }

  /**
   * Creates an empty CoreMedia RichText Document with required namespace
   * and processing instructions.
   */
  static createCoreMediaRichTextDocument(): Document {
    const doc: Document = document.implementation.createDocument(COREMEDIA_RICHTEXT_NAMESPACE_URI, "div");
    (doc.firstChild as Element).setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
    const pi = doc.createProcessingInstruction("xml", 'version="1.0" encoding="utf-8"');
    doc.insertBefore(pi, doc.firstChild);
    return doc;
  }
}
