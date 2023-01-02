const parser = new DOMParser();

/**
 * Type-Guard for DOM `Document`.
 *
 * @param value - value to guard
 */
export const isDocument = (value: unknown): value is Document => value instanceof Document;

/**
 * Create a document from a given HTML string.
 *
 * @param htmlString - string to parse
 */
export const documentFromHtml = (htmlString: string): Document => parser.parseFromString(htmlString, "text/html");
/**
 * Create a document from a given XML string.
 *
 * @param xmlString - string to parse
 */
export const documentFromXml = (xmlString: string): Document => parser.parseFromString(xmlString, "text/xml");
