/* eslint-disable no-null/no-null */
import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/Rule";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { isElement } from "@coremedia/ckeditor5-dom-support/Elements";
import { namespaces } from "../Namespaces";

const nsXml = namespaces.xml;

/**
 * Configuration for mapping language attributes.
 */
export interface PreferLangAttributeConfig {
  /**
   * Attribute key to prefer in data representation.
   */
  preferInData?: string;
  /**
   * Attribute key to prefer in data view representation.
   */
  preferInView?: string;
  /**
   * Priority of mapping.
   */
  priority?: PriorityString;
}

/**
 * Default configuration to apply.
 */
export const defaultPreferLangAttributeConfig: Required<PreferLangAttributeConfig> = {
  preferInData: "xml:lang",
  preferInView: "lang",
  priority: "normal",
};

/**
 * Extract language attribute value. Extracting means, that all corresponding
 * attributes will be removed and if any attribute provides a value, it is
 * returned.
 *
 * Value is provided by preferring `xml:lang` over `lang`, as defined for
 * HTML processing.
 *
 * @param el - element to possibly get language attributes from
 */
const extractLangAttributes = (el: Element): string | null => {
  const preferredAttr: Attr | null = [
    el.getAttributeNodeNS(nsXml, "lang"),
    // For some reason in processing we may have an attribute without
    // correct namespace URI applied.
    el.getAttributeNodeNS(null, "xml:lang"),
    el.getAttributeNodeNS(el.namespaceURI, "lang"),
    el.getAttributeNodeNS(null, "lang"),
  ]
    .map((current): Attr | null => {
      if (current) {
        el.removeAttributeNode(current);
        if (!current.value.trim()) {
          // Irrelevant language attribute
          return null;
        }
      }
      return current;
    })
    .reduce((previous, current): Attr | null => {
      if (previous?.value) {
        return previous;
      }
      return current;
    });
  return preferredAttr?.value ?? null;
};

/**
 * Maps `xml:lang` and `lang` from data (CoreMedia RichText) to `lang`.
 * Just as in the [standard definition](https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes#attr-lang),
 * `xml:lang` is preferred over `lang` when both are set in CoreMedia RichText.
 *
 * Note, that on transformation to data, the language will always be stored
 * in `xml:lang`.
 */
export const preferLangAttribute = (config?: PreferLangAttributeConfig): RuleConfig => {
  const { preferInData, preferInView, priority } = {
    ...defaultPreferLangAttributeConfig,
    ...config,
  };

  const preferAttribute = (el: Element, key: string): void => {
    const value = extractLangAttributes(el)?.trim();
    if (value) {
      const namespace = key.startsWith("xml:") ? nsXml : el.namespaceURI;
      // Possible pitfall: setAttributeNS requires a qualified name, while
      // related methods removeAttributeNS, getAttributeNS require localName
      // instead.
      el.setAttributeNS(namespace, key, value);
    }
  };

  return {
    id: "prefer-lang-attribute",
    toData: {
      imported: (node): Node => {
        if (isElement(node)) {
          preferAttribute(node, preferInData);
        }
        return node;
      },
      priority,
    },
    toView: {
      imported: (node): Node => {
        if (isElement(node)) {
          preferAttribute(node, preferInView);
        }
        return node;
      },
      priority,
    },
  };
};
