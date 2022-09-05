/* eslint no-null/no-null: off */

/**
 * Flattens a nested array of a given type.
 * @example
 * ```
 * flatten([["a"], ["b"]]) → ["a", "b"]
 * ```
 * @param arr - array to flatten
 */
const flatten = <T>(arr: T[][]): T[] => ([] as T[]).concat(...arr);

/**
 * Decodes all entities to plain characters.
 */
const decodeEntity = (str: string): string => {
  const ENTITY_ELEMENT = document.createElement("div");
  // noinspection InnerHTMLJS
  ENTITY_ELEMENT.innerHTML = str;
  return ENTITY_ELEMENT.textContent as string;
};

/**
 * Encodes all given characters to a decimal entity representation.
 */
const encodeString = (str: string): string => {
  const text: string = decodeEntity(str);
  // Takes care of Unicode characters. https://mathiasbynens.be/notes/javascript-unicode
  const chars: string[] = [...text];
  return chars.map((c) => `&#${c.codePointAt(0)};`).join("");
};

const xmlParser = new DOMParser();

const parseXml = (xmlData: string): Document => {
  const xmlDocument: Document = xmlParser.parseFromString(xmlData, "text/xml");
  if (xmlDocument.documentElement.outerHTML.indexOf("parsererror") >= 0) {
    throw new Error(`Failed parsing XML: ${xmlData}: ${xmlDocument.documentElement.outerHTML}`);
  }
  return xmlDocument;
};

/**
 * Suppresses Console Output while executing the given function, if
 * `silent === true`.
 *
 * @param call - function to execute
 * @param silent - flag, if output shall be suppressed or not
 */
const silenced = (call: () => void, silent?: boolean): void => {
  const consoleOutputs: (keyof Console)[] = ["log", "error", "warn", "info", "debug"];
  const spies: jest.SpyInstance[] = [];
  consoleOutputs.forEach((output) => {
    const spy = jest.spyOn(console, output);
    spies.push(spy);
    if (silent) {
      spy.mockImplementation(() => null);
    }
  });
  try {
    call();
  } finally {
    spies.forEach((spy) => spy.mockRestore());
  }
};

export { flatten, decodeEntity, encodeString, parseXml, silenced };
