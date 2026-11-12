export const domParser = new DOMParser();
export const xmlSerializer = new XMLSerializer();
export const parseXml = (xml: string): Document => domParser.parseFromString(xml, "text/xml");
export const serialize = (document: Document): string => xmlSerializer.serializeToString(document);
