import { isDocument } from "./Documents";
import { isElement } from "./Elements";
import { isDocumentFragment } from "./DocumentFragments";

/**
 * Type-Guard for DOM `ParentNode`.
 *
 * @param value - value to guard
 */
export const isParentNode = (value: unknown): value is ParentNode =>
  isDocument(value) || isDocumentFragment(value) || isElement(value);
