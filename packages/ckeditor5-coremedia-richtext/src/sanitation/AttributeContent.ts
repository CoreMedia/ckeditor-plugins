import { Strictness } from "../Strictness";

/**
 * Definition details of some attribute.
 */
export interface AttributeContent {
  /**
   * Validation for attribute value. May respect strictness level.
   *
   * @param value - value to validate
   * @param strictness - strictness level
   * @returns `true` if value is considered valid; `false` if not.
   */
  validateValue(value: string | null, strictness: Strictness): boolean;
}

/**
 * Represents an attribute, that is valid always, no matter of strictness
 * level. Typically used for attributes with CDATA content.
 */
export const acAny: AttributeContent = {
  validateValue(): true {
    return true;
  },
};
