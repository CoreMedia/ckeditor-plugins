/* eslint no-null/no-null: off */

/*
 * =============================================================================
 * This is a straightforward implementation of `coremedia-richtext-1.0.dtd`.
 * It is meant for validation and filtering. The structure of the definitions
 * is similar to the DTD, so that it should be easy detecting similarities.
 * =============================================================================
 */

import { ElementProxy, TextProxy } from "@coremedia/ckeditor5-dataprocessor-support";
import { Logger, LoggerProvider } from "@coremedia/ckeditor5-logging";
import { Strictness } from "../../Strictness";

/**
 * Validator type for attribute values.
 *
 * @param value - the attribute value to validate
 * @param strictness - mode for checking validity
 * @returns `true` if attribute value is considered valid; `false` if not
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
type Attributes = Record<string, AttributeSpecification>;

/**
 * Similar to a Relax-NG ModelGroup, this specifies possible contents of
 * an element. This is not an exact mapping, but enough for the
 * CoreMedia RichText 1.0 DTD validation.
 *
 * `nestedElementNames` is similar to `choice` et al.
 * `mayBeEmpty` is similar to `zeroOrMore`.
 * `mayContainText` is a shortcut for specifying `PCDATA` as a possible nested
 * element.
 *
 * To simulate `oneOrMore` ensure that `mayBeEmpty` is `false` and either
 * `mayContainText` is `true` or `nestedElementNames` is non-empty.
 */
interface ModelGroup {
  /**
   * Signals if this element is valid without any contents.
   * Defaults to `false` if unset.
   */
  mayBeEmpty?: boolean;
  /**
   * Signals if this element may contain text nodes. This
   * is not applied to child elements.
   * Defaults to `false` if unset.
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
   * Names of parent elements, which may hold this element. Not meant
   * to be filled manually, but to be registered on initialization.
   */
  parentElementNames?: string[];
}

/**
 * Specifies all supported elements.
 */
type Elements = Record<string, ElementSpecification>;

/**
 * In previous implementations, attribute values were not validated, and thus
 * possibly invalid values had not been removed. This action fulfills
 * exactly this contract for `LEGACY` mode.
 */
const REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY: InvalidAttributeValueAction = (attrValue, strictness) =>
  strictness === Strictness.LEGACY ? attrValue : undefined;

const NOTHING_TODO_ON_MISSING_ATTRIBUTE: MissingAttributeAction = () => undefined;

// noinspection HttpUrlsUsage
const COREMEDIA_RICHTEXT_1_0_NAMESPACE = "http://www.coremedia.com/2003/richtext-1.0";
const XLINK_NAMESPACE = "http://www.w3.org/1999/xlink";

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
const LANGUAGE: AttributeValueValidator = (v, s) => (s === Strictness.STRICT ? LANGUAGE_PATTERN.test(v) : true);
/**
 * one or more digits
 */
const NUMBER: AttributeValueValidator = (v, s) => (s === Strictness.STRICT ? /^\d+$/.test(v) : true);
/**
 * a Uniform Resource Identifier, see [RFC2396]
 *
 * Note: While we may validate a URI to some extent, we experienced CKEditor
 * not doing much validation here and thus, `href` may be any string. Because
 * of this, we don't apply strict checking here, even if requested by configuration.
 */
const URI: AttributeValueValidator = () => true;
/**
 * Used for titles, etc.
 */
const TEXT: AttributeValueValidator = CDATA;
/**
 * nn for pixels or nn% for percentage length
 */
const LENGTH: AttributeValueValidator = (v, s) => (s === Strictness.STRICT ? /^\d+%?$/.test(v) : true);

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
    onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
  },
};

const ATTRIBUTE_GROUP_I18N: Attributes = {
  "lang": {
    valueValidator: LANGUAGE,
    onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
  },
  "xml:lang": {
    valueValidator: LANGUAGE,
    onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
  },
  "dir": {
    valueValidator: (v) => ["ltr", "rtl"].includes(v),
    onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
  },
};

const ATTRIBUTE_GROUP_ATTRS: Attributes = { ...ATTRIBUTE_GROUP_COREATTRS, ...ATTRIBUTE_GROUP_I18N };

const ATTRIBUTE_GROUP_CELLHALIGN: Attributes = {
  align: {
    valueValidator: (v) => ["left", "center", "right"].includes(v),
    onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
  },
};

const ATTRIBUTE_GROUP_CELLVALIGN: Attributes = {
  valign: {
    valueValidator: (v) => ["top", "middle", "bottom", "baseline"].includes(v),
    onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
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

const MODEL_GROUP_SPECIAL: ModelGroup = {
  nestedElementNames: ["br", "span", "img"],
};

const MODEL_GROUP_PHRASE: ModelGroup = {
  nestedElementNames: ["em", "strong", "sub", "sup"],
};

const MODEL_GROUP_INLINE_BASE: ModelGroup = {
  nestedElementNames: ["a", ...MODEL_GROUP_SPECIAL.nestedElementNames, ...MODEL_GROUP_PHRASE.nestedElementNames],
};

const MODEL_GROUP_INLINE: ModelGroup = {
  mayBeEmpty: true,
  mayContainText: true,
  nestedElementNames: MODEL_GROUP_INLINE_BASE.nestedElementNames,
};

/* ===================================================[ Block Elements ]===== */

const MODEL_GROUP_LISTS: ModelGroup = {
  nestedElementNames: ["ul", "ol"],
};

const MODEL_GROUP_BLOCKTEXT: ModelGroup = {
  nestedElementNames: ["pre", "blockquote"],
};

const MODEL_GROUP_BLOCK_BASE: ModelGroup = {
  nestedElementNames: [
    "p",
    ...MODEL_GROUP_LISTS.nestedElementNames,
    ...MODEL_GROUP_BLOCKTEXT.nestedElementNames,
    "table",
  ],
};

const MODEL_GROUP_BLOCK: ModelGroup = {
  mayBeEmpty: true,
  nestedElementNames: MODEL_GROUP_BLOCK_BASE.nestedElementNames,
};

/**
 * Mixes Block and Inline and is used for list items, etc.
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
  nestedElementNames: [...MODEL_GROUP_SPECIAL.nestedElementNames, ...MODEL_GROUP_PHRASE.nestedElementNames],
};

/**
 * `<pre>` elements use `Inline` excluding `<img>`, `<sup>` or `<sub>`.
 */
const MODEL_GROUP_PRE_CONTENT: ModelGroup = {
  mayBeEmpty: true,
  mayContainText: true,
  nestedElementNames: ["a", "br", "span", ...MODEL_GROUP_PHRASE.nestedElementNames],
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
      "xmlns": {
        valueValidator: (s) => COREMEDIA_RICHTEXT_1_0_NAMESPACE === s,
        onInvalidValue: () => COREMEDIA_RICHTEXT_1_0_NAMESPACE,
        onMissingAttribute: () => COREMEDIA_RICHTEXT_1_0_NAMESPACE,
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
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
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
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
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
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
      },
      "xlink:href": {
        valueValidator: URI,
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
        // Earlier processing should actually have removed this element without
        // href. This fix just ensures that a required attribute is set.
        onMissingAttribute: () => "",
      },
      "xlink:role": {
        valueValidator: CDATA,
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
      },
      "xlink:title": {
        valueValidator: CDATA,
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
      },
      "xlink:show": {
        valueValidator: (s) => ["new", "replace", "embed", "other", "none"].includes(s),
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
      },
      "xlink:actuate": {
        valueValidator: (s) => ["onRequest", "onLoad"].includes(s),
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
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
      "alt": {
        valueValidator: TEXT,
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
        onMissingAttribute: () => "",
      },
      "height": {
        valueValidator: LENGTH,
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
      },
      "width": {
        valueValidator: LENGTH,
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
      },
      "xlink:type": {
        valueValidator: (s) => "simple" === s,
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
      },
      // Earlier processing should actually have removed this element without
      // href. This fix just ensures that a required attribute is set.
      "xlink:href": {
        valueValidator: CDATA,
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
        onMissingAttribute: () => "",
      },
      "xlink:role": {
        valueValidator: CDATA,
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
      },
      "xlink:title": {
        valueValidator: CDATA,
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
      },
      "xlink:show": {
        valueValidator: (s) => "embed" === s,
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
      },
      "xlink:actuate": {
        valueValidator: (s) => "onLoad" === s,
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
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
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
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
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
      },
      rowspan: {
        valueValidator: NUMBER,
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
      },
      colspan: {
        valueValidator: NUMBER,
        onInvalidValue: REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY,
      },
    },
  },
};

/**
 * Strictness levels available for compatibility API. It is recommended to
 * provide some best-effort compatible mapping of strictness levels. For
 * example, in v11 `Strictness.NONE` had been introduced, which will be
 * transformed to the less strict level `Strictness.LEGACY`.
 */
export type V10Strictness = Extract<Strictness, Strictness.STRICT | Strictness.LOOSE | Strictness.LEGACY>;

/**
 * Representation of CoreMedia RichText 1.0 Schema.
 */
export default class RichTextSchema {
  static readonly #logger: Logger = LoggerProvider.getLogger("RichTextSchema");
  readonly #strictness: V10Strictness;

  constructor(strictness: V10Strictness) {
    this.#strictness = strictness;
    RichTextSchema.#initParentElementNames(ELEMENTS);
  }

  /**
   * Initializes property `parentElementNames` derived from the existing
   * relationship parent to child. Thus, add a reverse mapping for easier
   * lookup.
   *
   * @param elements - element schema to process
   */
  static #initParentElementNames(elements: Elements): void {
    const logger = RichTextSchema.#logger;

    Object.keys(elements).forEach((elementName) => {
      const nestedElementNames: string[] = elements[elementName].nestedElementNames;
      nestedElementNames.forEach((nested) => {
        if (elements.hasOwnProperty(nested)) {
          const nestedElementSpecification = elements[nested];
          const newParents: string[] = nestedElementSpecification.parentElementNames ?? [];
          if (!newParents.includes(elementName)) {
            newParents.push(elementName);
          }
          nestedElementSpecification.parentElementNames = newParents;
        } else {
          throw new Error(`Nested Element <${nested}> of element <${elementName}> not available in schema definition.`);
        }
      });
    });
    if (logger.isDebugEnabled()) {
      logger.debug("Initialized child-parent relationship.");
      Object.keys(elements).forEach((elementName) => {
        logger.debug(`    Initialized <${elementName}> to be child of:`, elements[elementName].parentElementNames);
      });
    }
  }

  isTextAllowedAtParent(text: TextProxy): boolean {
    const logger = RichTextSchema.#logger;
    const parentName = text.parentElement?.name;
    if (!parentName) {
      logger.debug(
        `Text nodes without parent element not allowed. Will signal 'not allowed at parent' for text node:`,
        text,
      );
      return false;
    }

    const elementSpecification = ELEMENTS[parentName];
    if (!elementSpecification) {
      // Element isn't specified. Not allowed at all.
      logger.debug(`Element <${parentName}> not specified and thus, not allowed as parent of text-node.`);
      return false;
    }

    const isAllowed = elementSpecification.mayContainText ?? false;

    if (!isAllowed) {
      logger.debug(`Text nodes are not allowed at <${parentName}>. Will signal 'not allowed at parent' for:`, text);
    }
    return isAllowed;
  }

  /**
   * Checks, if the given element is known to be valid the current parent.
   *
   * @param element - element to validate
   * @returns `true` if the element is allowed at parent or if the element has
   * no parent; `false` if the element is already marked for removal (name is
   * empty or null) or if the given element is not allowed at parent.
   */
  isElementAllowedAtParent(element: ElementProxy): boolean {
    const logger = RichTextSchema.#logger;

    const elementName = element.name?.toLowerCase();
    if (!elementName) {
      // Nothing to do, we are about to be removed.
      logger.debug(`Element's name unset. Most likely already registered for removal.`, element);
      return false;
    }

    const elementSpecification = ELEMENTS[elementName];
    if (!elementSpecification) {
      // Element isn't specified. Not allowed at all.
      logger.debug(`Element <${elementName}> not specified and thus, not allowed at current parent.`);
      return false;
    }

    const parentName = element.parentElement?.name;
    const isAtRoot = !element.parentElement;

    if (isAtRoot) {
      if (elementSpecification.parentElementNames) {
        logger.debug(`Element <${elementName}> not allowed at root.`);
        return false;
      }
      return true;
    } else if (!elementSpecification.parentElementNames) {
      logger.debug(`Element <${elementName}> not allowed at parent <${parentName}>.`);
      return false;
    }

    const isAllowedAtParent = elementSpecification.parentElementNames.includes(parentName as string);
    if (!isAllowedAtParent) {
      logger.debug(`Element <${elementName}> not allowed at parent <${parentName}>.`);
    }
    return isAllowedAtParent;
  }

  /**
   * Final clean-up of hierarchy.
   * This method is meant as "last resort" providing a valid CoreMedia RichText
   * DTD.
   *
   * Note that changes are only applied to the mutable element. It is required
   * to persist these changes to propagate it to the wrapped delegate element.
   *
   * @param element - element to process
   */
  adjustHierarchy(element: ElementProxy): void {
    const logger = RichTextSchema.#logger;
    const elementName = element.name?.toLowerCase();

    if (!this.isElementAllowedAtParent(element)) {
      element.replaceByChildren = true;
      logger.debug(`Element not allowed at parent. Removing: ${elementName}`);
      return;
    }

    const elementSpecification = ELEMENTS[elementName || ""];
    if (elementSpecification?.mayBeEmpty === false && element.isEmpty()) {
      element.remove = true;
      logger.debug(`Element empty but must not be empty. Removing: ${elementName}`);
    }
  }

  /**
   * Final clean-up of attributes.
   * This method is meant as "last resort" providing a valid CoreMedia RichText
   * DTD.
   *
   * Note that changes are only applied to the mutable element. It is required
   * to persist these changes to propagate it to the wrapped delegate element.
   *
   * @param element - element to process
   */
  adjustAttributes(element: ElementProxy): void {
    const elementName = element.name;
    if (!elementName) {
      // Nothing to do, we are about to be removed.
      return;
    }
    const elementSpecification = ELEMENTS[elementName.toLowerCase()];
    if (!elementSpecification) {
      // Element isn't specified. Nothing to do regarding attributes.
      return;
    }
    const attributeSpecifications = elementSpecification.attributeList;
    const specifiedAttributes = Object.keys(attributeSpecifications);
    this.#deleteNotAllowedAttributes(element, specifiedAttributes);
    this.#fixOrDeleteAttributesHavingInvalidValues(element, attributeSpecifications);
    this.#setDefaultForMissingRequiredAttributes(element, specifiedAttributes, attributeSpecifications);
  }

  #deleteNotAllowedAttributes(element: ElementProxy, specifiedAttributes: string[]) {
    const actualAttributes = Object.keys(element.attributes);
    const notAllowedAttributes: string[] = actualAttributes.filter(
      (a) => !specifiedAttributes.includes(a.toLowerCase()),
    );

    if (notAllowedAttributes.length > 0) {
      RichTextSchema.#logger.debug(
        `${notAllowedAttributes.length} unsupported attribute(s) found at <${element.name}>. Attribute(s) will be removed prior to storing to server.`,
        {
          element,
          attributes: notAllowedAttributes,
        },
      );
      // To fix, we may migrate attributes to Map<> instead.
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      notAllowedAttributes.forEach((attributeName) => delete element.attributes[attributeName]);
    }
  }

  #fixOrDeleteAttributesHavingInvalidValues(element: ElementProxy, attributeSpecifications: Attributes) {
    const allowedActualAttributes = Object.keys(element.attributes);

    allowedActualAttributes.forEach((attributeName) => {
      const attributeValue = element.attributes[attributeName];
      // null = to be deleted; nothing to validate then
      if (attributeValue !== null) {
        const specification = attributeSpecifications[attributeName.toLowerCase()];
        const attributeValid = specification.valueValidator(attributeValue, this.#strictness);
        // Note that this may also remove required attributes — but having invalid values.
        // This is important for subsequent processing.
        if (!attributeValid) {
          const invalidValueHandler = specification.onInvalidValue ?? REMOVE_ATTRIBUTE_KEEP_ONLY_ON_LEGACY;
          const suggestedValue = invalidValueHandler(attributeValue, this.#strictness);
          if (suggestedValue === undefined) {
            RichTextSchema.#logger.debug(
              `Removing attribute ${attributeName} as its value "${attributeValue}" is invalid for <${element.name}>.`,
            );
            // To fix, we may migrate attributes to Map<> instead.
            // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
            delete element.attributes[attributeName];
          } else if (suggestedValue !== attributeValue) {
            RichTextSchema.#logger.debug(
              `Adjusting attribute ${attributeName} for <${element.name}>: As its value "${attributeValue}" is invalid, changed it to "${suggestedValue}".`,
            );
            element.attributes[attributeName] = suggestedValue;
          }
        }
      }
    });
  }

  #setDefaultForMissingRequiredAttributes(
    element: ElementProxy,
    specifiedAttributes: string[],
    attributeSpecifications: Attributes,
  ) {
    const validActualAttributes = Object.keys(element.attributes);
    const possiblyMissingAttributes = specifiedAttributes.filter(
      (a) => !validActualAttributes.includes(a.toLowerCase()),
    );

    possiblyMissingAttributes.forEach((attributeName) => {
      const specification = attributeSpecifications[attributeName.toLowerCase()];
      const handler = specification.onMissingAttribute ?? NOTHING_TODO_ON_MISSING_ATTRIBUTE;
      const suggestedValue = handler();
      if (suggestedValue !== undefined) {
        RichTextSchema.#logger.debug(
          `Adjusting attribute ${attributeName} for <${element.name}>: As required attribute "${attributeName}" is unset, set it to "${suggestedValue}".`,
        );
        element.attributes[attributeName] = suggestedValue;
      }
    });
  }
}
