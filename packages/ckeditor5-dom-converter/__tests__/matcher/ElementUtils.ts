export const parser = new DOMParser();
export const serializer = new XMLSerializer();

export const dataNs = "http://www.coremedia.com/2003/richtext-1.0";
export const dataViewNs = "http://www.w3.org/1999/xhtml";

export const serialize = (node: Node): string => {
  try {
    return serializer.serializeToString(node);
  } catch (e) {
    return `Serialization failed: ${e}`;
  }
};

export const html = (htmlString: string): Document => parser.parseFromString(htmlString, "text/html");
export const xml = (xmlString: string): Document => parser.parseFromString(xmlString, "text/xml");

export type ElementSelector = (doc: Document) => Element;

export const first =
  (): ElementSelector =>
  (doc: Document): Element => {
    const { documentElement } = doc;
    const { firstElementChild } = documentElement;
    if (!firstElementChild) {
      throw new Error(`first: Missing first element: ${serialize(doc)}`);
    }
    return firstElementChild;
  };

export const select =
  (selectors: string): ElementSelector =>
  (doc: Document): Element => {
    const result = doc.querySelector(selectors);
    if (!result) {
      throw new Error(`select: Cannot find element by selectors "${selectors}" in: ${serialize(doc)}`);
    }
    return result;
  };

export const element = (doc: Document, selector: ElementSelector) => selector(doc);
