export { isDocument } from "./TypeGuards";

const parser = new DOMParser();

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
