/*
 * =============================================================================
 * This is a straightforward implementation of `coremedia-richtext-1.0.dtd`.
 * It is meant for validation and filtering. The structure of the definitions
 * is very similar to the DTD, so that it should be easy detecting similarities.
 * =============================================================================
 */

import { MutableElement } from "@coremedia/ckeditor5-dataprocessor-support/index";
import Logger from "@coremedia/coremedia-utils/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/logging/LoggerProvider";

/**
 * Strictness for Schema validation.
 */
export enum Strictness {
  /**
   * `STRICT` enforces completely valid CoreMedia RichText 1.0. In addition to
   * `LOOSE` it will check for <em>meant to be</em>, such as a type called
   * `Number` which states to be numbers only, but regarding the schema allows
   * any (unchecked) character data. In case of `STRICT` non-numbers will be
   * rated invalid.
   */
  STRICT,
  /**
   * `LOOSE` will only check, what the scheme will detect. Given the example
   * about numbers for `STRICT` mode, `LOOSE` will cause to accept any
   * character data.
   */
  LOOSE,
  /**
   * For CKEditor 4 CoreMedia RichText adaptions did not filter for invalid
   * attribute values, but just for required or forbidden attributes. This
   * is the behavior the mode `LEGACY` simulates.
   */
  LEGACY,
}

/**
 * Validator type for attribute values.
 * @param value the attribute value to validate
 * @param strictness mode for checking validity
 * @return `true` if attribute value is considered valid; `false` if not
 */
type AttributeValueValidator = (value: string, strictness?: Strictness) => boolean;

/**
 * Action how to handle invalid attribute values.
 *
 * `undefined` signals that the attribute shall be removed.
 * Any string value will replace the existing attribute value.
 * The given original attribute value may be used to fix the value, if
 * possible. For loose checks, may even return the attribute as is.
 */
type InvalidAttributeValueAction = (attrValue: string, strictness?: Strictness) => undefined | string;

/**
 * Action, what to do if an attribute is missing.
 *
 * `undefined` signals, that nothing should be done (most likely not
 * a required attribute), any string value will add the attribute
 * with the given value.
 */
type MissingAttributeAction = () => undefined | string;

/**
 * Specification of an attribute.
 */
interface AttributeSpecification {
  /**
   * Used to validate an existing value.
   */
  valueValidator: AttributeValueValidator;
  /**
   * Defines behavior for unmatched values.
   */
  onInvalidValue?: InvalidAttributeValueAction;
  /**
   * Defines behavior for missing attributes.
   */
  onMissingAttribute?: MissingAttributeAction;
}

/**
 * Map of attribute-names (lower-case) to their corresponding specification.
 */
interface Attributes {
  [attributeName: string]: AttributeSpecification;
}

/**
 * Similar to a Relax NG ModelGroup this specifies possible contents of
 * an element. This is not an exact mapping, but sufficient for the purpose
 * of the CoreMedia RichText 1.0 DTD validation.
 *
 * `nestedElementNames` is similar to `choice` et al.
 * `mayBeEmpty` is similar to `zeroOrMore`.
 * `mayContainText` is a shortcut for specifying `PCDATA` as possible nested
 * element.
 *
 * To simulate `oneOrMore` ensure that `mayBeEmpty` is `false` and either
 * `mayContainText` is `true` or `nestedElementNames` is non-empty.
 */
interface ModelGroup {
  /**
   * Signals if this element is valid without any contents.
   */
  mayBeEmpty?: boolean;
  /**
   * Signals if this very element may contain text nodes. This
   * is not applied to child elements.
   */
  mayContainText?: boolean;
  /**
   * Names of possibly nested elements.
   */
  nestedElementNames: string[];
}

/**
 * Specification for an element. In addition to a `ModelGroup` allows
 * specifying supported attributes.
 */
interface ElementSpecification extends ModelGroup {
  /**
   * Supported attributes.
   */
  attributeList: Attributes;
  /**
   * Names of parent elements which may hold this very element. Not meant
   * to be filled manually, but to be registered on initialization.
   */
  parentElementNames?: string[];
}

/**
 * Specifies all supported elements.
 */
interface Elements {
  [elementName: string]: ElementSpecification;
}

/**
 * In previous implementations attribute values were not validated, and thus
 * possibly invalid values had not been removed. This action fulfills
 * exactly this contract for `LEGACY` mode.
 */
const REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY: InvalidAttributeValueAction = (attrValue, strictness) => {
  return strictness === Strictness.LEGACY ? attrValue : undefined;
};

const NOTHING_TODO_ON_MISSING_ATTRIBUTE: MissingAttributeAction = () => undefined;

const COREMEDIA_RICHTEXT_1_0_NAMESPACE = "http://www.coremedia.com/2003/richtext-1.0";
const XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";

/**
 * Validates a given URI.
 *
 * @see <a href="https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url">Check if a JavaScript string is a URL - Stack Overflow</a>
 */
const URI_PATTERN = new RegExp(
  "^(https?:\\/\\/)?" + // protocol
  "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
  "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
  "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
  "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
  "(\\#[-a-z\\d_]*)?$", // fragment locator
  "i"
);

/**
 * Pattern for validating language tags.
 *
 * @see <a href="https://stackoverflow.com/questions/3962543/how-can-i-validate-a-culture-code-with-a-regular-expression/3962783#3962783">regex - How can I validate a culture code with a regular expression? - Stack Overflow</a>
 * @see <a href="https://tools.ietf.org/html/bcp47">BCP 47 - Tags for Identifying Languages</a>
 */
const LANGUAGE_PATTERN = /^[a-zA-Z]{1,8}(-[a-zA-Z0-9]{1,8})*$/;

const CDATA: AttributeValueValidator = () => true;

/**
 * a language code, as per [RFC1766]
 */
const LANGUAGE: AttributeValueValidator = (v, s) => (s === Strictness.STRICT) ? LANGUAGE_PATTERN.test(v) : true;
/**
 * one or more digits
 */
const NUMBER: AttributeValueValidator = (v, s) => (s === Strictness.STRICT) ? /^\d+$/.test(v) : true;
/**
 * a Uniform Resource Identifier, see [RFC2396]
 */
const URI: AttributeValueValidator = (v, s) => (s === Strictness.STRICT) ? URI_PATTERN.test(v) : true;
/**
 * used for titles etc.
 */
const TEXT: AttributeValueValidator = CDATA;
/**
 * nn for pixels or nn% for percentage length
 */
const LENGTH: AttributeValueValidator = (v, s) => (s === Strictness.STRICT) ? /^\d+%?$/.test(v) : true;

/*
 * =============================================================================
 *
 * Attribute Groups
 *
 * =============================================================================
 */

const ATTRIBUTE_GROUP_COREATTRS: Attributes = {
  class: {
    valueValidator: CDATA,
    onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
  },
};

const ATTRIBUTE_GROUP_I18N: Attributes = {
  lang: {
    valueValidator: LANGUAGE,
    onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
  },
  "xml:lang": {
    valueValidator: LANGUAGE,
    onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
  },
  dir: {
    valueValidator: (v) => ["ltr", "rtl"].indexOf(v) >= 0,
    onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
  },
};

const ATTRIBUTE_GROUP_ATTRS: Attributes = { ...ATTRIBUTE_GROUP_COREATTRS, ...ATTRIBUTE_GROUP_I18N };

const ATTRIBUTE_GROUP_CELLHALIGN: Attributes = {
  align: {
    valueValidator: (v) => ["left", "center", "right"].indexOf(v) >= 0,
    onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
  },
};

const ATTRIBUTE_GROUP_CELLVALIGN: Attributes = {
  valign: {
    valueValidator: (v) => ["top", "middle", "bottom", "baseline"].indexOf(v) >= 0,
    onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
  },
};

/*
 * =============================================================================
 *
 * Model Groups
 *
 * While given as `ENTITY` in DTD, Relax NG will represent the entities for
 * nested elements by model groups. This representation simulates the idea
 * of these model groups.
 *
 * `__INLINE` vs. `_INLINE`: Two underscore represent the private groups, which
 * are just to be used by other model groups. The first one is represented by
 * lowercase name `inline` in DTD, while the second one is represented by
 * capitalized name `Inline` in DTD.
 *
 * =============================================================================
 */

/* ====================================================[ Text Elements ]===== */

const MODEL_GROUP__SPECIAL: ModelGroup = {
  nestedElementNames: ["br", "span", "img"],
};

const MODEL_GROUP__PHRASE: ModelGroup = {
  nestedElementNames: ["em", "strong", "sub", "sup"],
};

const MODEL_GROUP__INLINE: ModelGroup = {
  nestedElementNames: ["a", ...MODEL_GROUP__SPECIAL.nestedElementNames, ...MODEL_GROUP__PHRASE.nestedElementNames],
};

const MODEL_GROUP_INLINE: ModelGroup = {
  mayBeEmpty: true,
  mayContainText: true,
  nestedElementNames: MODEL_GROUP__INLINE.nestedElementNames,
};

/* ===================================================[ Block Elements ]===== */

const MODEL_GROUP__LISTS: ModelGroup = {
  nestedElementNames: ["ul", "ol"],
};

const MODEL_GROUP__BLOCKTEXT: ModelGroup = {
  nestedElementNames: ["pre", "blockquote"],
};

const MODEL_GROUP__BLOCK: ModelGroup = {
  nestedElementNames: [
    "p",
    ...MODEL_GROUP__LISTS.nestedElementNames,
    ...MODEL_GROUP__BLOCKTEXT.nestedElementNames,
    "table",
  ],
};

const MODEL_GROUP_BLOCK: ModelGroup = {
  mayBeEmpty: true,
  nestedElementNames: MODEL_GROUP__BLOCK.nestedElementNames,
};

/**
 * Mixes Block and Inline and is used for list items etc.
 */
const MODEL_GROUP_FLOW: ModelGroup = {
  mayBeEmpty: true,
  mayContainText: true,
  nestedElementNames: [...MODEL_GROUP_BLOCK.nestedElementNames, ...MODEL_GROUP_INLINE.nestedElementNames],
};

/* ==================================================[ Special Purpose ]===== */

/**
 * `<a>` elements use `Inline` excluding `<a>`.
 */
const MODEL_GROUP_A_CONTENT: ModelGroup = {
  mayBeEmpty: true,
  mayContainText: true,
  nestedElementNames: [...MODEL_GROUP__SPECIAL.nestedElementNames, ...MODEL_GROUP__PHRASE.nestedElementNames],
};

/**
 * `<pre>` elements use `Inline` excluding `<img>`, `<sup>` or `<sub>`.
 */
const MODEL_GROUP_PRE_CONTENT: ModelGroup = {
  mayBeEmpty: true,
  mayContainText: true,
  nestedElementNames: ["a", "br", "span", ...MODEL_GROUP__PHRASE.nestedElementNames],
};

/*
 * =============================================================================
 *
 * Elements
 *
 * =============================================================================
 */

const ELEMENTS: Elements = {
  /* ---------------------------------------------[ Document Structure ]----- */
  div: {
    ...MODEL_GROUP_BLOCK,
    attributeList: {
      xmlns: {
        valueValidator: (s) => COREMEDIA_RICHTEXT_1_0_NAMESPACE === s,
        onInvalidValue: () => {
          return COREMEDIA_RICHTEXT_1_0_NAMESPACE;
        },
        onMissingAttribute: () => {
          return COREMEDIA_RICHTEXT_1_0_NAMESPACE;
        },
      },
      "xmlns:xlink": {
        valueValidator: (s) => XLINK_NAMESPACE === s,
        onInvalidValue: () => XLINK_NAMESPACE,
        onMissingAttribute: () => XLINK_NAMESPACE,
      },
    },
  },
  /* -----------------------------------------------------[ Paragraphs ]----- */
  p: {
    ...MODEL_GROUP_INLINE,
    attributeList: { ...ATTRIBUTE_GROUP_ATTRS },
  },
  /* ----------------------------------------------------------[ Lists ]----- */
  ul: {
    mayBeEmpty: false,
    mayContainText: false,
    nestedElementNames: ["li"],
    attributeList: { ...ATTRIBUTE_GROUP_ATTRS },
  },
  ol: {
    mayBeEmpty: false,
    mayContainText: false,
    nestedElementNames: ["li"],
    attributeList: { ...ATTRIBUTE_GROUP_ATTRS },
  },
  li: {
    ...MODEL_GROUP_FLOW,
    attributeList: { ...ATTRIBUTE_GROUP_ATTRS },
  },
  /* ----------------------------------------------[ Preformatted Text ]----- */
  pre: {
    ...MODEL_GROUP_PRE_CONTENT,
    attributeList: {
      ...ATTRIBUTE_GROUP_ATTRS,
      "xml:space": {
        valueValidator: (s) => "preserve" === s,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
    },
  },
  /* ----------------------------------------------[ Block-like Quotes ]----- */
  blockquote: {
    ...MODEL_GROUP_BLOCK,
    attributeList: {
      ...ATTRIBUTE_GROUP_ATTRS,
      cite: {
        valueValidator: URI,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
    },
  },
  /* ---------------------------------------------[ The Anchor Element ]----- */
  a: {
    ...MODEL_GROUP_A_CONTENT,
    attributeList: {
      ...ATTRIBUTE_GROUP_ATTRS,
      "xlink:type": {
        valueValidator: (s) => "simple" === s,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
      "xlink:href": {
        valueValidator: URI,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
        // Earlier processing should actually have removed this element without
        // href. This fix just ensures, that a required attribute is set.
        onMissingAttribute: () => "",
      },
      "xlink:role": {
        valueValidator: CDATA,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
      "xlink:title": {
        valueValidator: CDATA,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
      "xlink:show": {
        valueValidator: (s) => ["new", "replace", "embed", "other", "none"].indexOf(s) >= 0,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
      "xlink:actuate": {
        valueValidator: (s) => ["onRequest", "onLoad"].indexOf(s) >= 0,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
    },
  },
  /* ------------------------------------------------[ Inline Elements ]----- */
  span: {
    ...MODEL_GROUP_INLINE,
    attributeList: { ...ATTRIBUTE_GROUP_ATTRS },
  },
  br: {
    mayBeEmpty: true,
    mayContainText: false,
    nestedElementNames: [],
    attributeList: { ...ATTRIBUTE_GROUP_COREATTRS },
  },
  em: {
    ...MODEL_GROUP_INLINE,
    attributeList: { ...ATTRIBUTE_GROUP_ATTRS },
  },
  strong: {
    ...MODEL_GROUP_INLINE,
    attributeList: { ...ATTRIBUTE_GROUP_ATTRS },
  },
  sub: {
    ...MODEL_GROUP_INLINE,
    attributeList: { ...ATTRIBUTE_GROUP_ATTRS },
  },
  sup: {
    ...MODEL_GROUP_INLINE,
    attributeList: { ...ATTRIBUTE_GROUP_ATTRS },
  },
  /* ---------------------------------------------------------[ Images ]----- */
  img: {
    mayBeEmpty: true,
    mayContainText: false,
    nestedElementNames: [],
    attributeList: {
      ...ATTRIBUTE_GROUP_ATTRS,
      alt: {
        valueValidator: TEXT,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
        onMissingAttribute: () => "",
      },
      height: {
        valueValidator: LENGTH,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
      width: {
        valueValidator: LENGTH,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
      "xlink:type": {
        valueValidator: (s) => "simple" === s,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
      // Earlier processing should actually have removed this element without
      // href. This fix just ensures, that a required attribute is set.
      "xlink:href": {
        valueValidator: CDATA,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
        onMissingAttribute: () => "",
      },
      "xlink:role": {
        valueValidator: CDATA,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
      "xlink:title": {
        valueValidator: CDATA,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
      "xlink:show": {
        valueValidator: (s) => "embed" === s,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
      "xlink:actuate": {
        valueValidator: (s) => "onLoad" === s,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
    },
  },
  /* ---------------------------------------------------------[ Tables ]----- */
  table: {
    mayBeEmpty: false,
    mayContainText: false,
    nestedElementNames: ["tbody", "tr"],
    attributeList: {
      ...ATTRIBUTE_GROUP_ATTRS,
      summary: {
        valueValidator: TEXT,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
    },
  },
  tbody: {
    mayBeEmpty: false,
    mayContainText: false,
    nestedElementNames: ["tr"],
    attributeList: {
      ...ATTRIBUTE_GROUP_ATTRS,
      ...ATTRIBUTE_GROUP_CELLHALIGN,
      ...ATTRIBUTE_GROUP_CELLVALIGN,
    },
  },
  tr: {
    mayBeEmpty: false,
    mayContainText: false,
    nestedElementNames: ["td"],
    attributeList: {
      ...ATTRIBUTE_GROUP_ATTRS,
      ...ATTRIBUTE_GROUP_CELLHALIGN,
      ...ATTRIBUTE_GROUP_CELLVALIGN,
    },
  },
  td: {
    ...MODEL_GROUP_FLOW,
    attributeList: {
      ...ATTRIBUTE_GROUP_ATTRS,
      ...ATTRIBUTE_GROUP_CELLHALIGN,
      ...ATTRIBUTE_GROUP_CELLVALIGN,
      abbr: {
        valueValidator: TEXT,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
      rowspan: {
        valueValidator: NUMBER,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
      colspan: {
        valueValidator: NUMBER,
        onInvalidValue: REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY,
      },
    },
  },
};

/**
 * Representation of CoreMedia RichText 1.0 Schema.
 */
export default class RichTextSchema {
  private static readonly logger: Logger = LoggerProvider.getLogger("RichTextSchema");
  private readonly strictness: Strictness;

  constructor(strictness: Strictness) {
    this.strictness = strictness;
    RichTextSchema.initParentElementNames(ELEMENTS);
  }

  /**
   * Initializes property `parentElementNames` derived from the existing
   * relationship parent to child. Thus, add a reverse mapping for easier
   * lookup.
   *
   * @param elements element schema to process
   */
  private static initParentElementNames(elements: Elements): void {
    Object.keys(elements).forEach((elementName) => {
      const nestedElementNames: string[] = elements[elementName].nestedElementNames;
      nestedElementNames.forEach((nested) => {
        if (elements.hasOwnProperty(nested)) {
          const nestedElementSpecification = elements[nested];
          const newParents: string[] = nestedElementSpecification.parentElementNames ?? [];
          if (newParents.indexOf(elementName) < 0) {
            newParents.push(elementName);
          }
          nestedElementSpecification.parentElementNames = newParents;
        } else {
          throw new Error(`Nested Element <${nested}> of element <${elementName}> not available in schema definition.`);
        }
      });
    });
    if (RichTextSchema.logger.isDebugEnabled()) {
      RichTextSchema.logger.debug("Initialized child-parent relationship.");
      Object.keys(elements).forEach((elementName) => {
        RichTextSchema.logger.debug(
          `    Initialized <${elementName}> to be child of:`,
          elements[elementName].parentElementNames
        );
      });
    }
  }

  /**
   * Checks, if the given element is known to be valid at current parent.
   *
   * @param element element to validate
   * @return `true` if element is allowed at parent or if element has no parent; `false` if element is already marked
   * for removal (name is empty or null) or if the given element is not allowed at parent.
   */
  isAllowedAtParent(element: MutableElement): boolean {
    const elementName = element.name?.toLowerCase();
    if (!elementName) {
      // Nothing to do, we are about to be removed.
      RichTextSchema.logger.debug(`Element's name unset. Most likely already registered for removal.`, element);
      return false;
    }

    const elementSpecification = ELEMENTS[elementName];
    if (!elementSpecification) {
      // Element not specified. Not allowed at all.
      RichTextSchema.logger.debug(`Element <${elementName}> not specified and thus, not allowed at current parent.`);
      return false;
    }

    const parentName = element.parentElement?.name;
    const isAtRoot = !element.parentElement;

    if (isAtRoot) {
      if (!!elementSpecification.parentElementNames) {
        RichTextSchema.logger.debug(`Element <${elementName}> not allowed at root.`);
        return false;
      }
      return true;
    } else if (!elementSpecification.parentElementNames) {
      RichTextSchema.logger.debug(`Element <${elementName}> not allowed at parent <${parentName}>.`);
      return false;
    }

    const isAllowedAtParent = elementSpecification.parentElementNames.indexOf(<string>parentName) >= 0;
    if (!isAllowedAtParent) {
      RichTextSchema.logger.debug(`Element <${elementName}> not allowed at parent <${parentName}>.`);
    }
    return isAllowedAtParent;
  }

  /**
   * Final clean-up of hierarchy.
   * This method is meant as "last resort" providing a valid CoreMedia RichText
   * DTD.
   *
   * Note, that changes are only applied to the mutable element. It is required
   * to persist these changes to propagate it to the wrapped delegate element.
   *
   * @param element
   */
  adjustHierarchy(element: MutableElement): void {
    if (!this.isAllowedAtParent(element)) {
      element.replaceByChildren = true;
    }

    const elementName = element.name;
    const elementSpecification = ELEMENTS[elementName?.toLowerCase() || ""];
    if (elementSpecification?.mayBeEmpty === false && element.isEmpty()) {
      element.remove = true;
    }
  }

  /**
   * Final clean-up of attributes.
   * This method is meant as "last resort" providing a valid CoreMedia RichText
   * DTD.
   *
   * Note, that changes are only applied to the mutable element. It is required
   * to persist these changes to propagate it to the wrapped delegate element.
   *
   * @param element element to process
   */
  adjustAttributes(element: MutableElement): void {
    const elementName = element.name;
    if (!elementName) {
      // Nothing to do, we are about to be removed.
      return;
    }
    const elementSpecification = ELEMENTS[elementName.toLowerCase()];
    if (!elementSpecification) {
      // Element not specified. Nothing to do regarding attributes.
      return;
    }
    const attributeSpecifications = elementSpecification.attributeList;
    const specifiedAttributes = Object.keys(attributeSpecifications);
    this.deleteNotAllowedAttributes(element, specifiedAttributes);
    this.fixOrDeleteAttributesHavingInvalidValues(element, attributeSpecifications);
    this.setDefaultForMissingRequiredAttributes(element, specifiedAttributes, attributeSpecifications);
  }

  private deleteNotAllowedAttributes(element: MutableElement, specifiedAttributes: string[]) {
    const actualAttributes = Object.keys(element.attributes);
    const notAllowedAttributes: string[] = actualAttributes.filter((a) => specifiedAttributes.indexOf(a.toLowerCase()) < 0);

    if (notAllowedAttributes.length > 0) {
      RichTextSchema.logger.debug(
        `${notAllowedAttributes.length} unsupported attribute(s) found at <${element.name}>. Attribute(s) will be removed prior to storing to server.`,
        {
          element: element,
          attributes: notAllowedAttributes,
        }
      );
      notAllowedAttributes.forEach((attributeName) => delete element.attributes[attributeName]);
    }
  }

  private fixOrDeleteAttributesHavingInvalidValues(element: MutableElement, attributeSpecifications: Attributes) {
    const allowedActualAttributes = Object.keys(element.attributes);

    allowedActualAttributes.forEach((attributeName) => {
      const attributeValue = element.attributes[attributeName];
      // null = to be deleted; nothing to validate then
      if (attributeValue !== null) {
        const specification = attributeSpecifications[attributeName.toLowerCase()];
        const attributeValid = specification.valueValidator(attributeValue, this.strictness);
        // Note, that this may also remove required attributes - but having invalid values.
        // This is important for subsequent processing.
        if (!attributeValid) {
          const invalidValueHandler = specification.onInvalidValue ?? REMOVE_ATTRIBUTE___KEEP_ONLY_ON_LEGACY;
          const suggestedValue = invalidValueHandler(attributeValue, this.strictness);
          if (suggestedValue === undefined) {
            RichTextSchema.logger.debug(
              `Removing attribute ${attributeName} as its value "${attributeValue}" is invalid for <${element.name}>.`
            );
            delete element.attributes[attributeName];
          } else if (suggestedValue !== attributeValue) {
            RichTextSchema.logger.debug(
              `Adjusting attribute ${attributeName} for <${element.name}>: As its value "${attributeValue}" is invalid, changed it to "${suggestedValue}".`
            );
            element.attributes[attributeName] = suggestedValue;
          }
        }
      }
    });
  }

  private setDefaultForMissingRequiredAttributes(
    element: MutableElement,
    specifiedAttributes: string[],
    attributeSpecifications: Attributes
  ) {
    const validActualAttributes = Object.keys(element.attributes);
    const possiblyMissingAttributes = specifiedAttributes.filter(
      (a) => validActualAttributes.indexOf(a.toLowerCase()) < 0
    );

    possiblyMissingAttributes.forEach((attributeName) => {
      const specification = attributeSpecifications[attributeName.toLowerCase()];
      const handler = specification.onMissingAttribute ?? NOTHING_TODO_ON_MISSING_ATTRIBUTE;
      const suggestedValue = handler();
      if (suggestedValue !== undefined) {
        RichTextSchema.logger.debug(
          `Adjusting attribute ${attributeName} for <${element.name}>: As required attribute "${attributeName}" is unset, set it to "${suggestedValue}".`
        );
        element.attributes[attributeName] = suggestedValue;
      }
    });
  }
}
