import { Strictness } from "./Strictness";
import { isElement } from "@coremedia/ckeditor5-dom-support/Elements";
import { isParentNode } from "@coremedia/ckeditor5-dom-support/ParentNodes";
import { SanitationListener, silentSanitationListener } from "./SanitationListener";
import { isKnownNamespacePrefix, namespaces } from "./Namespaces";
import { isText } from "@coremedia/ckeditor5-dom-support/Texts";

const pcdata = Symbol("pcdata");
const allowEmpty = Symbol("allowEmpty");

type ElementContent = string | typeof pcdata | typeof allowEmpty;

const special: ElementContent[] = ["br", "span", "img"];
const phrase: ElementContent[] = ["em", "strong", "sub", "sup"];
const inline: ElementContent[] = ["a", ...special, ...phrase];
const Inline: ElementContent[] = [allowEmpty, pcdata, ...inline];
const lists: ElementContent[] = ["ul", "ol"];
const blocktext: ElementContent[] = ["pre", "blockquote"];
const block: ElementContent[] = ["p", ...lists, ...blocktext, "table"];
const Block: ElementContent[] = [allowEmpty, ...block];
const Flow: ElementContent[] = [allowEmpty, pcdata, ...block, ...inline];
const aContent: ElementContent[] = [allowEmpty, pcdata, ...special, ...phrase];
const preContent: ElementContent[] = [allowEmpty, pcdata, "a", "br", "span", ...phrase];

export interface AttributeContent {
  validateValue(value: string | null, strictness: Strictness): boolean;
}

export const acAny: AttributeContent = {
  validateValue(): true {
    return true;
  },
};
export const acCData = acAny;
export const nmTokenRegExp = /^[a-zA-Z0-9._\-:]*$/;
export const acNmToken: AttributeContent = {
  validateValue(value: string | null, strictness: Strictness): boolean {
    if (!value || strictness === Strictness.LEGACY) {
      return true;
    }
    return nmTokenRegExp.test(value);
  },
};
export const acLanguageCode = acNmToken;
export const acNumber: AttributeContent = {
  validateValue(value: string | null, strictness: Strictness): boolean {
    if (!value || strictness !== Strictness.STRICT) {
      return true;
    }
    return !isNaN(parseInt(value));
  },
};
export const acUri = acCData;
export const acText = acCData;
export const lengthRegEx = /^\d+%?$/;
export const acLength: AttributeContent = {
  validateValue(value: string | null, strictness: Strictness): boolean {
    if (!value || strictness !== Strictness.STRICT) {
      return true;
    }
    return lengthRegEx.test(value);
  },
};
export const acEnum = (...validValues: (string | null)[]): AttributeContent => ({
  validateValue(value: string | null, strictness: Strictness): boolean {
    if (!value || strictness === Strictness.LOOSE) {
      return true;
    }
    return validValues.includes(value);
  },
});

export interface AttributeDefinitionConfig {
  localName: string;
  prefix?: string | null;
  namespaceURI?: string | null;
  /**
   * If required and missing: Use the given value as default value.
   */
  required?: string | false;
  fixed?: string | null;
  content?: AttributeContent;
  validateValue?: (value: string | null, strictness: Strictness) => boolean;
}

export type ParsedAttributeDefinitionConfig = Required<AttributeDefinitionConfig>;

export const parseAttributeDefinitionConfig = (config: AttributeDefinitionConfig): ParsedAttributeDefinitionConfig => {
  const content = config.content ?? acAny;
  // eslint-disable-next-line no-null/no-null
  const prefix = config.prefix ?? null;
  // Simplified to fall back to default namespace. May need to be adjusted, if
  // we want to provide more sophisticated namespace support.
  let namespaceURI = config.namespaceURI ?? namespaces.default;
  if (!namespaceURI && isKnownNamespacePrefix(prefix)) {
    namespaceURI = namespaces[prefix];
  }
  return {
    prefix,
    namespaceURI,
    required: false,
    // eslint-disable-next-line no-null/no-null
    fixed: null,
    content,
    validateValue: (value: string | null, strictness: Strictness): boolean => content.validateValue(value, strictness),
    ...config,
  };
};

export const coreClassAttr = parseAttributeDefinitionConfig({ localName: "class", content: acCData });
export const coreAttrs: ParsedAttributeDefinitionConfig[] = [coreClassAttr];
export const i18nLangAttr = parseAttributeDefinitionConfig({ localName: "lang", content: acLanguageCode });
export const i18nXmlLangAttr = parseAttributeDefinitionConfig({
  localName: "lang",
  prefix: "xml",
  content: acLanguageCode,
});
export const i18nDirAttr = parseAttributeDefinitionConfig({ localName: "dir", content: acEnum("ltr", "rtl") });
export const i18nAttrs: ParsedAttributeDefinitionConfig[] = [i18nLangAttr, i18nXmlLangAttr, i18nDirAttr];
export const commonAttrs: ParsedAttributeDefinitionConfig[] = [...coreAttrs, ...i18nAttrs];

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
  listener: SanitationListener
) => {
  // Used internally and as state to possibly trigger revalidation.
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

class ElementConfig {
  readonly #attributesByPrefixAndLocalName: Map<string | DefaultPrefix, Map<string, ParsedAttributeDefinitionConfig>> =
    new Map<string | DefaultPrefix, Map<string, ParsedAttributeDefinitionConfig>>();
  readonly #requiredAttributesByPrefixAndLocalName: Map<string | DefaultPrefix, Map<string, string>> = new Map<
    string | DefaultPrefix,
    Map<string, string>
  >();

  constructor(public allowed: ElementContent[] = [], public attributes: ParsedAttributeDefinitionConfig[] = []) {
    // Parse Attribute Configuration for faster lookup.
    this.attributes.forEach((config) => {
      this.#registerAttributeDefinitionConfig(config);
    });
  }

  #registerAttributeDefinitionConfig(config: ParsedAttributeDefinitionConfig): void {
    const { localName } = config;
    const prefix = config.prefix ?? defaultPrefix;
    this.#addToKnownAttributes(prefix, localName, config);
    if (typeof config.required === "string") {
      this.#addToRequiredAttributes(prefix, localName, config.required);
    }
  }

  #addToKnownAttributes(
    prefix: string | DefaultPrefix,
    localName: string,
    config: ParsedAttributeDefinitionConfig
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

  process(element: Element, strictness: Strictness, listener: SanitationListener): void {
    this.#removeInvalidChildren(element, listener);
    if (this.#removeOnInvalidEmptyState(element, listener)) {
      // No need to perform further checks.
      return;
    }
    this.#processAttributes(element, strictness, listener);
  }

  /**
   * Checks if the given child node is valid according to configuration.
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

    if (isElement(node)) {
      const { parentElement } = node;
      // Instead of declaring namespace URI explicitly, we expect it to be of
      // the same namespace as its parent. More sophisticated behavior will
      // require refactoring down to how to configure elements.
      if (node.namespaceURI !== parentElement?.namespaceURI || node.prefix !== parentElement.prefix) {
        return false;
      }
      return allowed.includes(node.localName);
    }

    return false;
  }

  #isInvalidChild(node: ChildNode): boolean {
    return !this.#isValidChild(node);
  }

  /**
   * Removes all invalid children of given node, including elements and
   * character data. Strategies include removing a child directly or
   * replacing it by its child nodes. As the latter process may result in
   * additional invalid child nodes, processing continues until all child
   * nodes are considered valid.
   *
   * @param node - node to analyze
   * @param listener - listener to report applied changes to
   */
  #removeInvalidChildren(node: ParentNode, listener: SanitationListener): void {
    let possiblyDirty = true;
    while (possiblyDirty) {
      possiblyDirty = [...node.childNodes]
        .map((childNode) => this.#removeInvalidChild(node, childNode, listener))
        .reduce((previous, current) => previous || current, false);
    }
  }

  #removeInvalidChild(parent: ParentNode, child: ChildNode, listener: SanitationListener): boolean {
    if (this.#isInvalidChild(child)) {
      return removeInvalidAtParent(parent, child, listener);
    }
    return false;
  }

  /**
   * Removes element, if it is (now) empty and must not be empty.
   *
   * @param element - element to validate
   * @param listener - listener to inform on issues
   * @returns `true` if element got removed (or: should have been removed);
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
  #processAttributes(element: Element, strictness: Strictness, listener: SanitationListener): void {
    const { attributes } = element;
    for (const attribute of attributes) {
      if (attribute.localName === "xmlns" || attribute.prefix === "xmlns") {
        // Namespaces handled later.
        continue;
      }
      const { value } = attribute;
      const config = this.#getAttributeConfig(attribute);

      // We combine check for invalid attribute and invalid attribute value.
      // If we require more sophisticated reporting, we may want to split
      // it up instead.
      if (!config) {
        listener.removeInvalidAttr(element, attribute, "invalidAtElement");
      } else {
        const fixed = config.fixed;
        // Cleanup: Remove fixed attributes, that are irrelevant to store.
        if (fixed && fixed === value) {
          // Cleanup: We expect a fixed value to be valid by definition and that
          // it is obsolete to forward it to stored data.
          element.removeAttributeNode(attribute);
        } else if (!config.validateValue(value, strictness)) {
          listener.removeInvalidAttr(element, attribute, "invalidValue");
          element.removeAttributeNode(attribute);
        }

        // We may, as suggested by TSDoc, also remove irrelevant attributes, if
        // they match the default values as provided by DTD. Skipped for now.
      }
    }
    this.#processRequiredAttributes(element);
  }

  /**
   * Apply possibly missing required attributes.
   *
   * @param element - element to possibly add required attributes to
   */
  #processRequiredAttributes(element: Element) {
    for (const [prefix, byLocalName] of this.#requiredAttributesByPrefixAndLocalName.entries()) {
      // eslint-disable-next-line no-null/no-null
      const actualPrefix = prefix === defaultPrefix ? null : prefix;
      const prefixString = actualPrefix ? `${actualPrefix}:` : "";
      for (const [localName, defaultValue] of byLocalName) {
        const qualifiedName = `${prefixString}${localName}`;
        if (!element.hasAttribute(qualifiedName)) {
          let namespaceURI = element.lookupNamespaceURI(actualPrefix);
          if (actualPrefix && isKnownNamespacePrefix(actualPrefix) && !namespaceURI) {
            namespaceURI = namespaces[actualPrefix];
          }
          element.setAttributeNS(namespaceURI, qualifiedName, defaultValue);
        }
      }
    }
  }

  /**
   * Get configuration of _known_ attribute, `undefined` if corresponding
   * attribute is not defined. Note, that for proper namespace/prefix support,
   * attributes must have been created with full namespace support. Thus,
   * using `setAttribute("xml:lang", "en")` would create an attribute, that
   * cannot be handled by this, as the prefix will be `null` for this attribute
   * then.
   *
   * @param attribute - attribute to get configuration for
   */
  #getAttributeConfig(attribute: Attr): ParsedAttributeDefinitionConfig | undefined {
    const prefix = attribute.prefix ?? defaultPrefix;
    const { localName } = attribute;
    const byPrefix = this.#attributesByPrefixAndLocalName.get(prefix);
    return byPrefix?.get(localName);
  }
}

export const richTextElementNames = [
  "div",
  "p",
  "ul",
  "ol",
  "li",
  "pre",
  "blockquote",
  "a",
  "span",
  "br",
  "em",
  "strong",
  "sub",
  "sup",
  "img",
  "table",
  "tbody",
  "tr",
  "td",
];
export type RichTextElementName = typeof richTextElementNames[number];
export type SupportedRichTextElements = Record<RichTextElementName, ElementConfig>;

export const divElement = new ElementConfig(Block);

export const pElement = new ElementConfig(Inline, commonAttrs);
export const ulElement = new ElementConfig(["li"], commonAttrs);
export const olElement = new ElementConfig(["li"], commonAttrs);
export const liElement = new ElementConfig(Flow, commonAttrs);
export const preXmlSpaceAttr = parseAttributeDefinitionConfig({
  localName: "space",
  prefix: "xml",
  content: acEnum("preserve"),
  fixed: "preserve",
});
export const preElement = new ElementConfig(preContent, [...commonAttrs, preXmlSpaceAttr]);
export const blockquoteCiteAttr = parseAttributeDefinitionConfig({
  localName: "cite",
  content: acUri,
});
export const blockquoteElement = new ElementConfig(Block, [...commonAttrs, blockquoteCiteAttr]);
export const aXLinkTypeAttr = parseAttributeDefinitionConfig({
  localName: "type",
  prefix: "xlink",
  content: acEnum("simple"),
  fixed: "simple",
});
export const aXLinkHrefAttr = parseAttributeDefinitionConfig({
  localName: "href",
  prefix: "xlink",
  content: acUri,
  required: "",
});
export const aXLinkRoleAttr = parseAttributeDefinitionConfig({ localName: "role", prefix: "xlink", content: acCData });
export const aXLinkTitleAttr = parseAttributeDefinitionConfig({
  localName: "title",
  prefix: "xlink",
  content: acCData,
});
export const aXLinkShowAttr = parseAttributeDefinitionConfig({
  localName: "show",
  prefix: "xlink",
  content: acEnum("new", "replace", "embed", "other", "none"),
});
export const aXLinkActuateAttr = parseAttributeDefinitionConfig({
  localName: "actuate",
  prefix: "xlink",
  content: acEnum("onRequest", "onLoad"),
});
export const aSpecialAttrs = [
  aXLinkTypeAttr,
  aXLinkHrefAttr,
  aXLinkRoleAttr,
  aXLinkTitleAttr,
  aXLinkShowAttr,
  aXLinkActuateAttr,
];
export const aElement = new ElementConfig(aContent, [...commonAttrs, ...aSpecialAttrs]);
export const spanElement = new ElementConfig(Inline, commonAttrs);
export const brElement = new ElementConfig([], coreAttrs);
export const emElement = new ElementConfig(Inline, commonAttrs);
export const strongElement = new ElementConfig(Inline, commonAttrs);
export const subElement = new ElementConfig(Inline, commonAttrs);
export const supElement = new ElementConfig(Inline, commonAttrs);
export const imgAltAttr = parseAttributeDefinitionConfig({ localName: "alt", content: acText, required: "" });
export const imgHeightAttr = parseAttributeDefinitionConfig({ localName: "height", content: acLength });
export const imgWidthAttr = parseAttributeDefinitionConfig({ localName: "width", content: acLength });
export const imgXLinkTypeAttr = parseAttributeDefinitionConfig({
  localName: "type",
  prefix: "xlink",
  content: acEnum("simple"),
  fixed: "simple",
});
export const imgXLinkHrefAttr = parseAttributeDefinitionConfig({
  localName: "href",
  prefix: "xlink",
  content: acUri,
  required: "",
});
export const imgXLinkRoleAttr = parseAttributeDefinitionConfig({
  localName: "role",
  prefix: "xlink",
  content: acCData,
});
export const imgXLinkTitleAttr = parseAttributeDefinitionConfig({
  localName: "title",
  prefix: "xlink",
  content: acCData,
});
export const imgXLinkShowAttr = parseAttributeDefinitionConfig({
  localName: "show",
  prefix: "xlink",
  content: acEnum("embed"),
  fixed: "embed",
});
export const imgXLinkActuateAttr = parseAttributeDefinitionConfig({
  localName: "actuate",
  prefix: "xlink",
  content: acEnum("onLoad"),
  fixed: "onLoad",
});
export const imgSpecialAttrs = [
  imgAltAttr,
  imgHeightAttr,
  imgWidthAttr,
  imgXLinkTypeAttr,
  imgXLinkHrefAttr,
  imgXLinkRoleAttr,
  imgXLinkTitleAttr,
  imgXLinkShowAttr,
  imgXLinkActuateAttr,
];
export const imgElement = new ElementConfig([], [...commonAttrs, ...imgSpecialAttrs]);
export const cellHAlignAttr = parseAttributeDefinitionConfig({
  localName: "align",
  content: acEnum("left", "center", "right"),
});
export const cellVAlignAttr = parseAttributeDefinitionConfig({
  localName: "valign",
  content: acEnum("top", "middle", "bottom", "baseline"),
});
export const tableSummaryAttr = parseAttributeDefinitionConfig({ localName: "summary", content: acText });

export const tableElement = new ElementConfig(["tbody", "tr"], [...commonAttrs, tableSummaryAttr]);
export const tbodyElement = new ElementConfig(["tr"], [...commonAttrs, cellHAlignAttr, cellVAlignAttr]);
export const trElement = new ElementConfig(["td"], [...commonAttrs, cellHAlignAttr, cellVAlignAttr]);

export const tdAbbrAttr = parseAttributeDefinitionConfig({ localName: "abbr", content: acText });
export const tdRowspanAttr = parseAttributeDefinitionConfig({ localName: "rowspan", content: acNumber });
export const tdColspanAttr = parseAttributeDefinitionConfig({ localName: "colspan", content: acNumber });
export const tdElement = new ElementConfig(Flow, [
  ...commonAttrs,
  tdAbbrAttr,
  tdRowspanAttr,
  tdColspanAttr,
  cellHAlignAttr,
  cellVAlignAttr,
]);

/**
 * Supported CoreMedia Rich Text 1.0 elements. Note, that it is expected, that
 * all elements are of the same namespace as the root element.
 */
// DevNote: To support different namespaceURIs of elements, it needs to become
// part of ElementConfig and possibly require some different lookup.
const supportedElements: SupportedRichTextElements = {
  div: divElement,
  p: pElement,
  ul: ulElement,
  ol: olElement,
  li: liElement,
  pre: preElement,
  blockquote: blockquoteElement,
  a: aElement,
  span: spanElement,
  br: brElement,
  em: emElement,
  strong: strongElement,
  sub: subElement,
  sup: supElement,
  img: imgElement,
  table: tableElement,
  tbody: tbodyElement,
  tr: trElement,
  td: tdElement,
};

export class RichTextSanitizer {
  constructor(
    public readonly strictness: Strictness = Strictness.STRICT,
    public readonly listener = silentSanitationListener
  ) {}

  sanitize<T extends Document>(document: T): T | false {
    this.listener.started();
    const { documentElement } = document;
    let result: T | false = document;
    // Regarding Prefix: While supported theoretically, CoreMedia Rich Text 1.0
    // with prefix is mostly unsupported in various layers of CoreMedia CMS.
    if (
      documentElement.localName !== "div" ||
      documentElement.namespaceURI !== namespaces.default ||
      documentElement.prefix
    ) {
      this.listener.fatal(`Invalid document element. Expected: <div>, Action: <${documentElement.localName}>`);
      result = false;
    } else {
      try {
        this.#sanitize(documentElement);
      } catch (e) {
        this.listener.fatal(`Sanitation failed with error: ${e}`, e);
        result = false;
      }
    }
    this.listener.stopped();
    return result;
  }

  #sanitize(element: Element, depth = 0): void {
    this.listener.enteringElement(element, depth);

    if (isParentNode(element)) {
      for (const childElement of element.children) {
        this.#sanitize(childElement, depth + 1);
      }
    }

    const { strictness, listener } = this;
    const { prefix, localName } = element;

    // We don't respect prefixed elements yet. Thus, any prefixed
    // elements are by default considered invalid. This, for example,
    // is true for `<xdiff:span>`. We expect them to be removed when
    // processing the parent element.
    if (!prefix) {
      // If this element is not supported, it is expected to be cleaned up
      // when parent node is processed. This again requires, that the root
      // element gets extra processing applied.
      supportedElements[localName]?.process(element, strictness, listener);
    }

    this.listener.leavingElement(element, depth);
  }
}
