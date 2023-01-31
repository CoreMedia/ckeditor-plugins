import { HtmlDomConverter } from "../src/HtmlDomConverter";
import { registerNamespacePrefixes } from "@coremedia/ckeditor5-dom-support/Namespaces";

/**
 * Simulates processing from HTML document as hold in data view layer in
 * CKEditor 5 to the data layer, which is an HTML-like XML document, such as
 * a CoreMedia Rich Text 1.0 document.
 */
export const toData = (converter: HtmlDomConverter, htmlDocument: Document, xmlDocument: Document): void => {
  // Typical process in DataProcessor implementation, to work on
  // fragments initially.
  const range = htmlDocument.createRange();
  range.selectNodeContents(htmlDocument.body);
  const fragment = range.extractContents();

  const converted = converter.convert(fragment);

  if (converted) {
    xmlDocument.documentElement.append(converted);
  }

  // Doing this late ensures, that we only register remaining namespaces
  // after transformation process.
  registerNamespacePrefixes(xmlDocument);
};

/**
 * Simulates processing of an XML document in data layer of CKEditor 5 to
 * an HTML document as used in data view layer as done in data-processing
 * of CKEditor 5.
 */
export const toDataView = (converter: HtmlDomConverter, xmlDocument: Document, htmlDocument: Document): void => {
  // Typical process in DataProcessor implementation, to work on
  // fragments initially.
  const range = xmlDocument.createRange();
  range.selectNodeContents(xmlDocument.documentElement);
  const fragment = range.extractContents();

  const converted = converter.convert(fragment);

  if (converted) {
    htmlDocument.body.append(converted);
  }

  // Doing this late ensures, that we only register remaining namespaces
  // after transformation process.
  registerNamespacePrefixes(htmlDocument);
};
