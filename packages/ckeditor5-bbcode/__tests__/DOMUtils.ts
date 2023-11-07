import { isHTMLElement } from "@coremedia/ckeditor5-dom-support";

const parser = new DOMParser();
const parseHtml = (html: string): Document => parser.parseFromString(html, "text/html");
const parseFirstElement = (html: string): Element | undefined => parseHtml(html).body.firstElementChild ?? undefined;
export const asHTMLElement = (value: unknown): HTMLElement | undefined => (isHTMLElement(value) ? value : undefined);

/**
 * Parses the given HTML and returns contained `HTMLElement`.
 *
 * @param html - HTML to parse.
 */
export const parseHTMLElement = (html: string): HTMLElement | undefined => asHTMLElement(parseFirstElement(html));

/**
 * Parses the given HTML and returns contained `HTMLElement`.
 *
 * @param html - HTML to parse.
 * @throws Error if a HTMLElement could not be extracted from parsed HTML
 */
export const requireHTMLElement = (html: string): HTMLElement => {
  const parsed = parseHTMLElement(html);
  if (!parsed) {
    throw new Error(`Failed parsing and getting required HTMLElement from: ${html}.`);
  }
  return parsed;
};

/**
 * Parses the given HTML as fragment, suitable to represent the _data view_
 * within the CKEditor 5 architecture.
 *
 * @param innerHtml - HTML to represent as fragment
 */
export const parseAsFragment = (innerHtml: string): DocumentFragment => {
  const parsedDocument = parseHtml(`<body>${innerHtml}</body>`);
  const result = new DocumentFragment();
  result.append(...parsedDocument.body.childNodes);
  return result;
};
