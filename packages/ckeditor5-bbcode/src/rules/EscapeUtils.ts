/**
 * Characters that need to be encoded when represented as BBCode URL
 * argument.
 */
const urlEncoded = {
  doubleQuote: `%22`,
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

// noinspection GrazieInspection
/**
 * This method provides the most robust way to represent attribute values
 * of type _URL_ in BBCode with reference to BBob parsing.
 *
 * The following rules are applied:
 *
 * * **Wrapped in Quotes:** Attributes for BBob are best wrapped into quotes to
 *   make BBob parser not struggle with spaces within attribute values. This
 *   function uses double quotes, as BBob does not respect single quotes.
 *
 * * **Escaping with URL Encoding:** In general, BBob is configured in CKEditor
 *   5 BBCode plugin to escape within text content via backslash. This works to
 *   some degree also within attributes, like, for example, for double quote
 *   to be escaped to `\"`.
 *
 *   Nonetheless, this function prefers URL encoded representation for:
 *   double quote, right and left square bracket.
 *
 * @param value - raw attribute value to transform
 */
export const toBBCodeUrlAttributeValue = (value: string): string => {
  const escaped = value
    .replace(/"/g, urlEncoded.doubleQuote)
    .replace(/\[/g, urlEncoded.openBracket)
    .replace(/]/g, urlEncoded.closeBracket);
  return `"${escaped}"`;
};

// noinspection GrazieInspection
/**
 * Transforms the given value that is meant to denote a URL to a representation
 * that may either be used as BBCode content like in
 * `[url]https://example.org/[/url]`, or as attribute value as in
 * `[url="https://example.org/"]Text[/url]`.
 *
 * The content representation is closer to the original value (or most of the
 * time even equal to it), as it provides only very defensive escaping.
 *
 * In contrast to this, the attribute representation is more strictly
 * escaped and is always wrapped into double quotes for best support in BBob
 * parsing.
 *
 * Thus, if to check for pretty-print options like shortened representation
 * of URLs as `[url]https://example.org/[/url]` instead of the semantically
 * equal `[url=https://example.org/]https://example.org/[/url]`, it is best
 * to use the content representation for comparison.
 *
 * @param value - value to provide representations for
 */
export const toBBCodeUrl = (value: string): { asContent: string; asAttribute: string } => ({
  asContent: escapeUrlForBBCodeAttribute(value),
  asAttribute: toBBCodeUrlAttributeValue(value),
});
