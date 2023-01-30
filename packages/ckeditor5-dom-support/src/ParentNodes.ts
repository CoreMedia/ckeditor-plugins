export { isParentNode } from "./TypeGuards";

/**
 * Retrieve all direct children matching given selectors.
 *
 * @param parent - the parent to start searching from
 * @param selectors - selector to match
 */
export const querySelectorAllDirectChildren = (parent: ParentNode, selectors: string): Element[] =>
  [...parent.querySelectorAll(selectors)].filter((e) => parent.isSameNode(e.parentElement));

/**
 * Retrieves first direct child matching given selectors.
 *
 * @param parent - the parent to start searching from
 * @param selectors - selector to match
 */
export const querySelectorDirectChild = (parent: ParentNode, selectors: string): Element | null =>
  [...parent.querySelectorAll(selectors)].find((e) => parent.isSameNode(e.parentElement)) ?? null;
