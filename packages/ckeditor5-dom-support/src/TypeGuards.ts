import { HasChildren, HasNamespaceUri } from "./Types";

/**
 * Type-guard if given value is an attribute instance `Attr`.
 *
 * @param value - value to validate
 */
export const isAttr = (value: unknown): value is Attr => value instanceof Attr;

/**
 * Type-Guard for DOM `CharacterData`.
 *
 * @param value - value to guard
 */
export const isCharacterData = (value: unknown): value is CharacterData => value instanceof CharacterData;

/**
 * Type-Guard for DOM `Comment`.
 *
 * @param value - value to guard
 */
export const isComment = (value: unknown): value is CharacterData => value instanceof Comment;

/**
 * Type-Guard for DOM `Document`.
 *
 * @param value - value to guard
 */
export const isDocument = (value: unknown): value is Document => value instanceof Document;

/**
 * Type-Guard for DOM `DocumentFragment`.
 *
 * @param value - value to guard
 */
export const isDocumentFragment = (value: unknown): value is DocumentFragment => value instanceof DocumentFragment;

/**
 * Type-Guard for DOM `Element`.
 *
 * @param value - value to guard
 */
export const isElement = (value: unknown): value is Element => value instanceof Element;

/**
 * Type-guard for DOM nodes providing a `namespaceURI` attribute.
 */
// DevNote: CSSNamespaceRule missing yet. Add, if required.
export const isHasNamespaceUri = (value: unknown): value is HasNamespaceUri => isAttr(value) || isElement(value);

/**
 * Type-Guard for DOM `HTMLAnchorElement`.
 *
 * @param value - value to guard
 */
export const isHTMLAnchorElement = (value: unknown): value is HTMLAnchorElement => value instanceof HTMLAnchorElement;

/**
 * Type-Guard for DOM `HTMLElement`.
 *
 * @param value - value to guard
 */
export const isHTMLElement = (value: unknown): value is HTMLElement => value instanceof HTMLElement;

/**
 * Type-Guard for DOM `HTMLImageElement`.
 *
 * @param value - value to guard
 */
export const isHTMLImageElement = (value: unknown): value is HTMLImageElement => value instanceof HTMLImageElement;

/**
 * Type-Guard for DOM `HTMLTableElement`.
 *
 * @param value - value to guard
 */
export const isHTMLTableElement = (value: unknown): value is HTMLTableElement => value instanceof HTMLTableElement;

/**
 * Type-Guard for DOM `ParentNode`.
 *
 * @param value - value to guard
 */
export const isParentNode = (value: unknown): value is HasChildren =>
  isDocument(value) || isDocumentFragment(value) || isElement(value);

/**
 * Type-Guard for DOM `Text`.
 *
 * @param value - value to guard
 */
export const isText = (value: unknown): value is Text => value instanceof Text;
