export { isAttr } from "./TypeGuards";

/**
 * Copies attributes from source element to target element.
 *
 * **Post-Conditions:**
 *
 * * Source element is not modified.
 * * Target element has at least the same attributes as the source element.
 *   Already existing attributes of same name are overwritten.
 *
 * @param source - source element to transfer attributes from
 * @param target - target element to transfer attributes to
 */
export const copyAttributesFrom = (source: Element, target: Element): void => {
  const { ownerDocument } = target;

  for (const sourceAttribute of source.attributes) {
    // Must not set attribute directly, as it would raise `InUseAttributeError`
    // otherwise.
    const importedAttribute = ownerDocument.importNode(sourceAttribute);
    target.setAttributeNodeNS(importedAttribute);
  }
};
