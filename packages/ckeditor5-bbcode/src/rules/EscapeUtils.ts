/**
 * Characters that need to be encoded when represented as BBCode URL
 * argument.
 */
const urlEncoded = {
  openBracket: "%5B",
  closeBracket: "%5D",
};

/**
 * Escapes the given URL, so that it does not contain open or close bracket.
 *
 * @param href - HREF attribute to encode for use as BBCode attribute value
 */
export const escapeUrlForBBCodeAttribute = (href: string): string =>
  href.replace(/\[/g, urlEncoded.openBracket).replace(/]/g, urlEncoded.closeBracket);
