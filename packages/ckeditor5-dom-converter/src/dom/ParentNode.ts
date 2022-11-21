import { isDocument } from "./Document";
import { isElement } from "./Element";
import { isDocumentFragment } from "./DocumentFragment";

export const isParentNode = (value: unknown): value is ParentNode =>
  isDocument(value) || isDocumentFragment(value) || isElement(value);
