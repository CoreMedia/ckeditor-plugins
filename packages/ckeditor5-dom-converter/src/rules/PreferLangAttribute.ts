import { RuleConfig } from "../Rule";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import { isElement } from "@coremedia/ckeditor5-dom-support/Elements";

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
   * Precedence of attributes to consider for value.
   */
  valuePrecedence?: string[];
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
  valuePrecedence: ["xml:lang", "lang"],
  priority: "normal",
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
  const { preferInData, preferInView, valuePrecedence, priority } = {
    ...defaultPreferLangAttributeConfig,
    ...config,
  };

  const extractValue = (el: Element): string | null => {
    let value: string | null = null;
    valuePrecedence.reverse().forEach((attr) => {
      value = el.getAttribute(attr) ?? value;
      // Cleanup nodes, so that in the end we have only one, thus, clean up
      // possible ambiguous state.
      el.removeAttribute(attr);
    });
    return value;
  };

  const preferAttribute = (el: Element, key: string): void => {
    const value = extractValue(el)?.trim();
    if (value) {
      el.setAttribute(key, value);
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
