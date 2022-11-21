/* eslint-disable no-null/no-null */

import { OnlyStrings } from "../types/FilterByType";

/**
 * Represents DOM `Document` (in contrast to CKEditor's view document,
 * for example).
 */
export type DomDocument = Document;
/**
 * Represents DOM `DocumentFragment` (in contrast to CKEditor's view document
 * fragment, for example).
 */
export type DomDocumentFragment = DocumentFragment;
/**
 * Represents DOM Node (in contrast to CKEditor's view node, for example).
 */
export type DomNode = Node;
/**
 * Represents DOM Text Node (in contrast to CKEditor's view text node, for example).
 */
export type DomText = Text;

export const isComment = (value: unknown): value is Comment => value instanceof Comment;

export const isDocument = (value: unknown): value is Document => value instanceof Document;

export const isDocumentFragment = (value: unknown): value is DocumentFragment => value instanceof DocumentFragment;

export const isElement = (value: unknown): value is Element => value instanceof Element;

export const isElementCSSInlineStyle = (value: unknown): value is ElementCSSInlineStyle => isHtmlElement(value);

export const isHtmlElement = (value: unknown): value is HTMLElement => value instanceof HTMLElement;

export const isNode = (value: unknown): value is Node => value instanceof Node;

export const isParentNode = (value: unknown): value is ParentNode =>
  isDocument(value) || isDocumentFragment(value) || isElement(value);

export const isText = (value: unknown): value is Text => value instanceof Text;

export interface CreateDocumentParams {
  namespace?: string;
  qualifiedName?: string;
  doctype?: DocumentType;
}

type CreateDocument = typeof document.implementation.createDocument;

export const createDocument = (params: CreateDocumentParams): ReturnType<CreateDocument> => {
  const { namespace, qualifiedName, doctype } = params;
  return document.implementation.createDocument(namespace ?? null, qualifiedName ?? null, doctype ?? null);
};

/**
 * Styles to provide via `getStyles`.
 */
export type Styles = Partial<OnlyStrings<CSSStyleDeclaration>>;

/**
 * Type for keys of `Styles`.
 */
export type StyleKey = keyof Styles;

/**
 * If element provides styles, returns them. Only set styles (thus, non-empty)
 * will be returned.
 *
 * @param element - element to get styles for
 */
export const getStyles = (element: Element): Styles => {
  const result: Styles = {};
  if (!isElementCSSInlineStyle(element)) {
    // No inline styles, just return empty.
    return result;
  }

  const style = element.style;

  Object.entries(style).forEach(([key, value]) => {
    const styleAttribute: StyleKey = key as StyleKey;
    if (value) {
      result[styleAttribute] = value;
    }
  });

  return result;
};

/*
export function* styles(element: Element): IterableIterator<[StyleKey, string]> {
  if (!isElementCSSInlineStyle(element)) {
    // No inline styles, just return.
    return;
  }

  const style = element.style;

  for (const entry of Object.entries(style)) {
    const key: StyleKey = entry[key];
    yield [key, value];
  }
}
*/

/**
 * DOM API often deals with `null` to represent an undefined/unset state. This
 * helper method, will transform these `null` values to `undefined` instead.
 *
 * @param value - value to possibly transform to `undefined` if `null`.
 */
export const preferUndefinedForNull = <T>(value: T): Exclude<T, null> | undefined => {
  if (value === null) {
    return undefined;
  }
  return value as Exclude<T, null>;
};
