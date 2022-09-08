/* eslint no-null/no-null: off */

import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

const logger = LoggerProvider.getLogger("BeanReference");

/**
 * A reference to some CoreMedia CMS bean.
 */
export interface BeanReference {
  /**
   * Reference to some bean ID.
   */
  $Ref: string;
}

/**
 * Type-Guard, if the given value is a reference to some CoreMedia CMS Bean.
 *
 * @param value - object to validate
 */
export const isBeanReference = (value: unknown): value is BeanReference => {
  if (typeof value !== "object" || !value || !("$Ref" in value)) {
    return false;
  }
  const rawRef: unknown = (value as BeanReference).$Ref;
  return typeof rawRef === "string";
};

/**
 * Type-Guard, if the given value is an array of references to some CoreMedia
 * CMS Bean.
 *
 * Note, that an empty array is considered an array of BeanReferences, too.
 *
 * @param value - object to validate
 */
export const isBeanReferences = (value: unknown): value is BeanReference[] => {
  if (!Array.isArray(value)) {
    return false;
  }
  return value.every(isBeanReference);
};

/**
 * Parses bean-references given as JSON-string.
 *
 * @param value - JSON string to parse
 * @returns bean references; `undefined` if string does not represent a valid array of bean-references
 */
export const parseBeanReferences = (value: string): BeanReference[] | undefined => {
  if (!value) {
    return undefined;
  }
  try {
    const parsed = JSON.parse(value);
    if (isBeanReferences(parsed)) {
      return parsed;
    }
  } catch (e) {
    logger.debug("Failed parsing bean reference from value.", { value }, e);
  }
  return undefined;
};
