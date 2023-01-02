import { isAttr } from "./Attrs";
import { isElement } from "./Elements";

/**
 * Artificial type for nodes providing a `namespaceURI`.
 */
export type HasNamespaceUri = Pick<Attr | Element | CSSNamespaceRule, "namespaceURI">;

/**
 * Type-guard for DOM nodes providing a `namespaceURI` attribute.
 */
// DevNote: CSSNamespaceRule missing yet. Add, if required.
export const isHasNamespaceUri = (value: unknown): value is HasNamespaceUri => isAttr(value) || isElement(value);
