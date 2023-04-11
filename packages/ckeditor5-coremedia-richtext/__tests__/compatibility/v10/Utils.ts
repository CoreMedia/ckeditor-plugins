/* eslint no-null/no-null: off */

import CoreMediaRichTextConfig, { COREMEDIA_RICHTEXT_CONFIG_KEY } from "../../../src/CoreMediaRichTextConfig";
import { Config as CKEditorConfig } from "@ckeditor/ckeditor5-utils";
import { getConfig } from "../../../src/compatibility/v10/V10CoreMediaRichTextConfig";

/**
 * Flattens a nested array of a given type.
 *
 * @example
 * ```
 * flatten([["a"], ["b"]]) → ["a", "b"]
 * ```
 * @param arr - array to flatten
 */
export const flatten = <T>(arr: T[][]): T[] => ([] as T[]).concat(...arr);

/**
 * Decodes all entities to plain characters.
 */
export const decodeEntity = (str: string): string => {
  const ENTITY_ELEMENT = document.createElement("div");
  // noinspection InnerHTMLJS
  ENTITY_ELEMENT.innerHTML = str;
  return ENTITY_ELEMENT.textContent as string;
};

/**
 * Encodes all given characters to a decimal entity representation.
 */
export const encodeString = (str: string): string => {
  const text: string = decodeEntity(str);
  // Takes care of Unicode characters. https://mathiasbynens.be/notes/javascript-unicode
  const chars: string[] = [...text];
  return chars.map((c) => `&#${c.codePointAt(0)};`).join("");
};

const xmlParser = new DOMParser();

export const parseXml = (xmlData: string): Document => {
  const xmlDocument: Document = xmlParser.parseFromString(xmlData, "text/xml");
  if (xmlDocument.documentElement.outerHTML.includes("parsererror")) {
    throw new Error(`Failed parsing XML: ${xmlData}: ${xmlDocument.documentElement.outerHTML}`);
  }
  return xmlDocument;
};

const richTextConfig: CoreMediaRichTextConfig = {
  compatibility: "v10",
};
// Need to mock `get` as starting with v11 we cannot provide an empty
// configuration anymore, as we have to set the compatibility explicitly.
// TODO[cke] Fix typing.
// @ts-expect-error - Requires Generic Type since CKEditor 5 37.x.
const v10Config: Pick<CKEditorConfig, "get"> & { [COREMEDIA_RICHTEXT_CONFIG_KEY]: CoreMediaRichTextConfig } = {
  [COREMEDIA_RICHTEXT_CONFIG_KEY]: richTextConfig,
  // Lightweight mocking only...
  get(name: string): unknown | undefined {
    if (name !== COREMEDIA_RICHTEXT_CONFIG_KEY) {
      return undefined;
    }
    return this[COREMEDIA_RICHTEXT_CONFIG_KEY];
  },
};

export const getV10Config = (): ReturnType<typeof getConfig> =>
  // @ts-expect-error - no strict typing here. It is legacy anyway.
  getConfig(v10Config);
