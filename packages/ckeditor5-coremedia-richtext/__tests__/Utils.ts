/**
 * Flattens a nested array of a given type.
 * @example
 * ```
 * flatten([["a"], ["b"]]) → ["a", "b"]
 * ```
 * @param arr array to flatten
 */
const flatten = <T>(arr: T[][]): T[] => (<T[]>[]).concat(...arr);

/**
 * Decodes all entities to plain characters.
 */
const decodeEntity = (str: string): string => {
  const ENTITY_ELEMENT = document.createElement("div");
  // noinspection InnerHTMLJS
  ENTITY_ELEMENT.innerHTML = str;
  return <string>ENTITY_ELEMENT.textContent;
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

export { flatten, decodeEntity, encodeString };
