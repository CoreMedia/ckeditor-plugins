import { isAttr } from "./Attr";
import { isElement } from "./Element";

/**
 * Supported types, we expect to get a `namespaceURI` from.
 */
export type HasNamespaceUri = Attr | Element;

/**
 * Type-guard for DOM nodes providing a `namespaceURI` attribute.
 */
export const isHasNamespaceUri = (value: unknown): value is HasNamespaceUri => isAttr(value) || isElement(value);
