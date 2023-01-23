/**
 * Placeholder for an element, that may hold character data.
 * Matches `#PCDATA` in element DTD configuration.
 */
export const pcdata = Symbol("pcdata");
/**
 * Placeholder for an element, that may (or must) be empty.
 * Matches element DTD configuration using an asterisk in contents definition
 * such as `(#PCDATA | p)*`.
 */
export const allowEmpty = Symbol("allowEmpty");
/**
 * Specifies allowed element contents, closely related to example in DTD such
 * as `(#PCDATA | p)*` which would be represented as
 * `[pcdata, allowEmpty, "p"]`.
 */
export type ElementContent = string | typeof pcdata | typeof allowEmpty;
