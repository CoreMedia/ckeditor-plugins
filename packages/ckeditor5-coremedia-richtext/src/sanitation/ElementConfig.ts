import { ParsedAttributeDefinitionConfig } from "./AttributeDefinitionConfig";
import { allowEmpty, ElementContent, pcdata } from "./ElementContent";
import { ActiveStrictness } from "../Strictness";
import { SanitationListener } from "./SanitationListener";
import {
  isElement,
  isHasNamespaceUri,
  isParentNode,
  isText,
  lookupNamespaceURI,
} from "@coremedia/ckeditor5-dom-support";
import { isKnownNamespacePrefix, namespaces } from "../Namespaces";

const defaultPrefix = Symbol("default");
type DefaultPrefix = typeof defaultPrefix;

/**
 * Remove child node from parent and signal `invalidAtParent`.
 *
 * @param parent - parent to remove node from
 * @param child - child to remove
 * @param listener - listener to report issues to
 * @returns `true`, if valid nodes of parent need to be reevaluated; `false` otherwise
 */
const removeInvalidAtParent = (
  parent: ParentNode,
  child: ChildNode | (ChildNode & ParentNode),
  listener: SanitationListener,
) => {
  // Used internally and as a state to possibly trigger revalidation.
  let replacedByChildren = false;
  listener.removeNode(child, "invalidAtParent");
  try {
    replacedByChildren = isParentNode(child) && child.hasChildNodes();
    if (replacedByChildren) {
      const { ownerDocument } = parent;
      const range = ownerDocument?.createRange() ?? new Range();
      range.selectNodeContents(child);
      const children = range.extractContents();
      parent.replaceChild(children, child);
    } else {
      parent.removeChild(child);
    }
  } catch (e) {
    listener.fatal(`Failed removing invalid child ${child.nodeName} at ${parent.nodeName}: ${e}`, e);
    // No need to trigger re-evaluation, as we have a fatal state anyway.
    replacedByChildren = false;
  }
  return replacedByChildren;
};

/**
 * An element configuration that should resemble the definition within a DTD.
 */
export class ElementConfig {
  /**
   * Pre-filled map for fast supported attribute lookup.
   */
  readonly #attributesByPrefixAndLocalName: Map<string | DefaultPrefix, Map<string, ParsedAttributeDefinitionConfig>> =
    new Map<string | DefaultPrefix, Map<string, ParsedAttributeDefinitionConfig>>();
  /**
   * Pre-filled map with required attributes and possible fallback values
   * to apply.
   */
  readonly #requiredAttributesByPrefixAndLocalName: Map<string | DefaultPrefix, Map<string, string>> = new Map<
    string | DefaultPrefix,
    Map<string, string>
  >();

  /**
   * Constructor.
   *
   * @param allowed - allowed nested elements
   * @param attributes - allowed attributes along with their definitions
   */
  constructor(
    public allowed: ElementContent[] = [],
    public attributes: ParsedAttributeDefinitionConfig[] = [],
  ) {
    // Parse Attribute Configuration for faster lookup.
    this.attributes.forEach((config) => {
      this.#registerAttributeDefinitionConfig(config);
    });
  }

  /**
   * Pre-fills maps for lookup during the validation process.
   *
   * @param config - attribute configuration to register
   */
  #registerAttributeDefinitionConfig(config: ParsedAttributeDefinitionConfig): void {
    const { localName } = config;
    const prefix = config.prefix ?? defaultPrefix;
    this.#addToKnownAttributes(prefix, localName, config);
    // Explicit type check required, as !config.required would prevent default
    // values of "".
    if (typeof config.required === "string") {
      this.#addToRequiredAttributes(prefix, localName, config.required);
    }
  }

  /**
   * Add to known attributes for the given element.
   *
   * @param prefix - prefix of the element; `defaultPrefix` for `null` in DOM.
   * @param localName - local name of attribute
   * @param config - attribute configuration
   */
  #addToKnownAttributes(
    prefix: string | DefaultPrefix,
    localName: string,
    config: ParsedAttributeDefinitionConfig,
  ): void {
    const byPrefix = this.#attributesByPrefixAndLocalName.get(prefix);
    if (!byPrefix) {
      const entry: Map<string, ParsedAttributeDefinitionConfig> = new Map<string, ParsedAttributeDefinitionConfig>();
      entry.set(localName, config);
      this.#attributesByPrefixAndLocalName.set(prefix, entry);
    } else {
      byPrefix.set(localName, config);
    }
  }

  /**
   * Add to required attributes for the given element.
   *
   * @param prefix - prefix of the element; `defaultPrefix` for `null` in DOM.
   * @param localName - local name of attribute
   * @param defaultValue - default value to apply for missing required
   * attribute.
   */
  #addToRequiredAttributes(prefix: string | DefaultPrefix, localName: string, defaultValue: string) {
    const byPrefix = this.#requiredAttributesByPrefixAndLocalName.get(prefix);
    if (!byPrefix) {
      const entry: Map<string, string> = new Map<string, string>();
      entry.set(localName, defaultValue);
      this.#requiredAttributesByPrefixAndLocalName.set(prefix, entry);
    } else {
      byPrefix.set(localName, defaultValue);
    }
  }

  /**
   * Processes validation for the given element and applies required DOM
   * manipulations for a valid state.
   *
   * @param element - element to process
   * @param strictness - strictness level to apply
   * @param listener - listener for reporting
   */
  process(element: Element, strictness: ActiveStrictness, listener: SanitationListener): void {
    this.#removeInvalidChildren(element, listener);
    if (this.#removeOnInvalidEmptyState(element, listener)) {
      // No need to perform further checks.
      return;
    }
    this.#processAttributes(element, strictness, listener);
  }

  /**
   * Checks if the given child node is valid, according to configuration.
   * Prior to checking the configuration, the method will ensure that a
   * given child shares the same `namespaceURI` as its parent.
   *
   * @param node - child node to analyze
   */
  #isValidChild(node: ChildNode): boolean {
    const { allowed } = this;
    // Text vs. CharacterData: CharacterData includes comments. Allowing comments
    // may break our checks for elements that must not be empty. If comments
    // shall be supported, we must adjust it here and refactor empty check.
    if (isText(node)) {
      return allowed.includes(pcdata);
    }

    if (!this.#hasCompatibleNamespaceAndPrefixWithParent(node)) {
      return false;
    }

    if (isElement(node)) {
      return allowed.includes(node.localName);
    }

    return false;
  }

  /**
   * Checks, if the `namespaceURI` of child node and parent are compatible.
   * Strictly speaking, if they are the same. But for any unset `namespaceURI`
   * at node, they are considered compatible.
   *
   * It also checks that both child node and parent have a compatible
   * prefix declaration.
   *
   * @param node - node to validate regarding its namespace (URI and prefix)
   */
  #hasCompatibleNamespaceAndPrefixWithParent(node: ChildNode): boolean {
    const { parentElement } = node;
    if (!isHasNamespaceUri(node) || !isHasNamespaceUri(parentElement)) {
      // Assume, they are compatible.
      return true;
    }
    if (!node.namespaceURI || !parentElement.namespaceURI) {
      // Assume, they are compatible.
      return true;
    }
    return node.namespaceURI === parentElement.namespaceURI && node.prefix === parentElement.prefix;
  }

  /**
   * Negation of `#isValidChild`, which may be suitable for filtering.
   *
   * @param node - child node to analyze
   */
  #isInvalidChild(node: ChildNode): boolean {
    return !this.#isValidChild(node);
  }

  /**
   * Removes all invalid children of given node, including elements and
   * character data. Strategies include removing a child directly or
   * replacing it with its child nodes. As the latter process may result in
   * additional invalid child nodes, processing continues until all child
   * nodes are considered valid.
   *
   * @param node - node to analyze
   * @param listener - listener to report applied changes to
   */
  #removeInvalidChildren(node: ParentNode, listener: SanitationListener): void {
    // Possibly Dirty: If a child node is replaced by its children, the new
    // structure may have become invalid. Revalidation is required then.
    let possiblyDirty = true;
    while (possiblyDirty) {
      possiblyDirty = [...node.childNodes]
        .map((childNode) => this.#removeInvalidChild(node, childNode, listener))
        .reduce((previous, current) => previous || current, false);
    }
  }

  /**
   * Possibly remove an invalid child.
   *
   * @param parent - parent to possibly remove invalid child
   * @param child - child to possibly remove, if invalid
   * @param listener - listener to inform on issues
   * @returns `true`, if structure changed, so that revalidation is required;
   * `false` if caller can just proceed.
   */
  #removeInvalidChild(parent: ParentNode, child: ChildNode, listener: SanitationListener): boolean {
    if (this.#isInvalidChild(child)) {
      return removeInvalidAtParent(parent, child, listener);
    }
    return false;
  }

  /**
   * Removes the element if it is (now) empty and must not be empty.
   *
   * @param element - element to validate
   * @param listener - listener to inform on issues
   * @returns `true` if the element got removed (or: should have been removed);
   * `false` if not
   */
  #removeOnInvalidEmptyState(element: Element, listener: SanitationListener): boolean {
    const { allowed } = this;
    // allowed.length => implicit declaration of "allowEmpty"
    const mayBeEmpty = allowed.length === 0 || allowed.includes(allowEmpty);
    if (!element.hasChildNodes() && !mayBeEmpty) {
      try {
        listener.removeNode(element, "mustNotBeEmpty");
        element.remove();
      } catch (e) {
        listener.fatal(`Failed removing invalid ${element.nodeName}: ${e}`, e);
      }
      return true;
    }
    return false;
  }

  /**
   * Processes the attributes of elements. Removes invalid or obsolete ones (due
   * to defaults or fixed state), adds possibly missing required attributes.
   *
   * @param element - element to check attributes of
   * @param strictness - strictness to apply
   * @param listener - listener to inform on issues
   */
  #processAttributes(element: Element, strictness: ActiveStrictness, listener: SanitationListener): void {
    const { attributes } = element;
    const attributesToRemoveFromElement: Attr[] = [];
    const attributesToRemoveFromListener: Attr[] = [];
    for (const attribute of attributes) {
      if (attribute.localName === "xmlns" || attribute.prefix === "xmlns" || attribute.localName.startsWith("xmlns:")) {
        // Namespaces handled later.
        continue;
      }
      const config = this.#getAttributeConfig(attribute);

      if (!config) {
        attributesToRemoveFromListener.push(attribute);
        attributesToRemoveFromElement.push(attribute);
      } else {
        const { fixed } = config;
        const { value } = attribute;
        // Cleanup: Remove fixed attributes, that are irrelevant to store.
        if (fixed && fixed === value) {
          // Cleanup: We expect a fixed value to be valid by definition and that
          // it is obsolete to forward it to stored data.
          attributesToRemoveFromElement.push(attribute);
        } else if (!config.validateValue(value, strictness)) {
          attributesToRemoveFromListener.push(attribute);
          attributesToRemoveFromElement.push(attribute);
        }
      }
    }
    attributesToRemoveFromListener.forEach((attr) => listener.removeInvalidAttr(element, attr, "invalidAtElement"));
    attributesToRemoveFromElement.forEach((attr) => element.removeAttributeNode(attr));
    this.#processRequiredAttributes(element);
  }

  /**
   * Apply possibly missing required attributes.
   *
   * @param element - element to possibly add required attributes to
   */
  #processRequiredAttributes(element: Element) {
    this.#requiredAttributesByPrefixAndLocalName.forEach((byLocalName, prefix) => {
      // eslint-disable-next-line no-null/no-null
      const actualPrefix = prefix === defaultPrefix ? null : prefix;
      const prefixString = actualPrefix ? `${actualPrefix}:` : "";
      byLocalName.forEach((defaultValue, localName) => {
        let namespaceURI = lookupNamespaceURI(element, actualPrefix);
        if (actualPrefix && isKnownNamespacePrefix(actualPrefix) && !namespaceURI) {
          namespaceURI = namespaces[actualPrefix];
        }
        const qualifiedName = `${prefixString}${localName}`;
        if (!element.hasAttributeNS(namespaceURI, localName) && !element.hasAttribute(qualifiedName)) {
          element.setAttributeNS(namespaceURI, qualifiedName, defaultValue);
        }
      });
    });
  }

  /**
   * Get configuration of _known_ attribute, `undefined` if the corresponding
   * attribute is not defined. Note that for proper namespace/prefix support,
   * attributes must have been created with full namespace support. Thus,
   * using `setAttribute("xml:lang", "en")` would create an attribute that
   * cannot be handled by this, as the prefix will be `null` for this attribute
   * then.
   *
   * @param attribute - attribute to get configuration for
   */
  #getAttributeConfig(attribute: Attr): ParsedAttributeDefinitionConfig | undefined {
    const prefix = attribute.prefix ?? defaultPrefix;
    const { localName } = attribute;
    return this.#getAttributeConfigFromCachedData(prefix, localName);
  }

  /**
   * Gets attribute configuration from cached data. May loop once, if
   * attributes are not properly represented in DOM, such as that `xml:space`
   * may be stored as attribute with prefix `null` and local name `xml:space`.
   * In these cases, a retry is triggered by manually splitting up prefix and
   * local name.
   *
   * @param prefix - prefix; possibly placeholder symbol for default prefix
   * @param localName - local name of attribute
   */
  #getAttributeConfigFromCachedData(
    prefix: string | DefaultPrefix,
    localName: string,
  ): ParsedAttributeDefinitionConfig | undefined {
    const byPrefix = this.#attributesByPrefixAndLocalName.get(prefix);
    const result = byPrefix?.get(localName);
    // In some contexts, the namespaceURI of a given attribute is null, while
    // the name contains a prefix, such as `xml:space`. We provide a fallback
    // here, by manually extracting the prefix.
    if (result === undefined && prefix === defaultPrefix && localName.includes(":")) {
      const manualPrefixRegExp = /^(?<p>[^:]*):(?<n>.*)$/;
      const match = localName.match(manualPrefixRegExp);
      if (match) {
        // @ts-expect-error: https://github.com/microsoft/TypeScript/issues/32098
        const { p, n }: { p: string; n: string } = match.groups;
        // As, for example, the prefix is now different from defaultPrefix, there
        // is no danger for endless recursion.
        return this.#getAttributeConfigFromCachedData(p, n);
      }
    }
    return result;
  }
}
