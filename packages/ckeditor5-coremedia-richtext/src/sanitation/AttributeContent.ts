import type { ActiveStrictness } from "../Strictness";
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
  validateValue(value: string | null, strictness: ActiveStrictness): boolean;
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

/**
 * Expresses content type `CDATA` in attribute declaration.
 */
export const acCData = acAny;

/**
 * Creates an attribute content definition of enumerated values.
 *
 * @param validValues - valid values an attribute may take
 */
export const acEnum = (...validValues: (string | null)[]): AttributeContent => ({
  validateValue(value: string | null, strictness: ActiveStrictness): boolean {
    if (strictness === Strictness.LEGACY) {
      return true;
    }
    return validValues.includes(value);
  },
});

const nmTokenRegExp = /^[a-zA-Z0-9._\-:]*$/;
/**
 * Expresses content type `NMTOKEN` in attribute definition.
 */
export const acNmToken: AttributeContent = {
  validateValue(value: string | null, strictness: ActiveStrictness): boolean {
    if (!value || strictness === Strictness.LEGACY) {
      return true;
    }
    return nmTokenRegExp.test(value);
  },
};
