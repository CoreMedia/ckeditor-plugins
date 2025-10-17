import { bbCodeLogger } from "../BBCodeLogger";

const { getUniqAttr } = await import("@bbob/plugin-helper");

/**
 * Consumer for an attribute name and its value.
 */
export type AttributeConsumer = (attrName: string, attrValue: unknown) => void;

/**
 * Iterates over each attribute (key, value pair) and passes it to the
 * given consumer.
 *
 * @param attrs - attributes to process
 * @param consumer - consumer to work an attribute's key/value pair
 */
export const forEachAttribute = (attrs: Record<string, unknown>, consumer: AttributeConsumer): void => {
  Object.entries(attrs).forEach(([attrName, attrValue]) => consumer(attrName, attrValue));
};

/**
 * Sets attributes at given element from set of attributes.
 *
 * Any possibly invalid properties (that raise an error, when trying to be
 * set) are ignored.
 *
 * @param element - element to set attributes at
 * @param attrs - attributes to set
 */
export const setAttributesFromTagAttrs = (element: HTMLElement, attrs: Record<string, unknown>): void => {
  const trySetAttribute: AttributeConsumer = (name, value): void => {
    try {
      // @ts-expect-error TODO must be a string here, but TagAttrs allows unknown values
      element.setAttribute(name, value);
    } catch (e) {
      bbCodeLogger.debug(
        `Ignoring error for setting attribute '${name}' for element ${element.localName} to value '${value}'.`,
        e,
      );
    }
  };

  forEachAttribute(attrs, trySetAttribute);
};

/**
 * Removes a possibly existing unique attribute as extra representation within
 * the returned result.
 *
 * Note that BBob represents unique attributes as _last attribute in an
 * object having the same attribute key and value_. As this may be subject
 * to change in future releases, this method is recommended as single entry
 * point, where you need to _strip any possibly existing unique attribute_
 * during processing.
 *
 * @param attrs - attributes to parse
 */
// see https://github.com/JiLiZART/BBob/issues/202
export const stripUniqueAttr = (
  attrs: Record<string, unknown>,
): {
  uniqueAttrValue?: Record<string, unknown>[string];
  otherAttrs: Record<string, unknown>;
} => {
  const uniqueAttrValue = getUniqAttr(attrs);

  // Contract for _no unique attribute set_.
  if (uniqueAttrValue === null) {
    return { otherAttrs: attrs };
  }

  const allAttrEntries = Object.entries(attrs);
  // Remove last attributes.
  allAttrEntries.pop();
  return {
    uniqueAttrValue,
    otherAttrs: Object.fromEntries(allAttrEntries),
  };
};

/**
 * Transforms a unique attribute to some named attribute. If override is
 * given, any already set attribute of that name will be overridden. Otherwise,
 * the value from named attributes will win over the unique attribute value.
 *
 * @param uniqueAttrName - name to map the unique attribute to
 * @param attrs - attributes to parse
 * @param override - if to override an already existing attribute of name given
 *  by `uniqueAttrName`
 * @param defaultValueSupplier - supplier for default value, if neither unique value nor attribute name exist
 */
export const uniqueAttrToAttr = (
  uniqueAttrName: string,
  attrs: Record<string, unknown>,
  override = true,
  defaultValueSupplier?: () => string,
): Record<string, unknown> => {
  const { uniqueAttrValue = defaultValueSupplier?.(), otherAttrs } = stripUniqueAttr(attrs);
  const valueFromOtherAttrs: unknown | undefined = otherAttrs[uniqueAttrName];

  const result: Record<string, unknown> = otherAttrs;

  if (uniqueAttrValue !== undefined && (override || valueFromOtherAttrs === undefined)) {
    result[uniqueAttrName] = uniqueAttrValue;
  }

  return result;
};
