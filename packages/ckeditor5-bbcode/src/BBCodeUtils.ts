const trimOnlyLeadingAndTrailingNewlines = (s: string): string => s.replace(/(^[\n\r]+|(?<![\n\r])[\n\r]+$)/g, "");
const trimOnlyLeadingNewLines = (s: string): string => s.replace(/^[\n\r]*/g, "");

/**
 * Different to `string.trim()` only removes leading and trailing newlines.
 * This may be relevant for elements with `white-space: pre;`, while for
 * all others, a simple `string.trim()` should do the trick.
 *
 * For `white-space: pre;` sections, other than newlines should not be removed
 * at least at the beginning of such a section, as it may corrupt indents.
 *
 * For trailing whitespace, complete trimming may be desirable. This may be
 * passed as an opt-in option.
 *
 * @param s - string to trim
 * @param options - options to trimming
 * @param options.trimEndWhitespace - if to trim all whitespace at the end of
 * string, thus, newlines and any other whitespace characters
 */
export const trimLeadingAndTrailingNewlines = (
  s: string,
  {
    trimEndWhitespace,
  }: {
    trimEndWhitespace?: boolean;
  } = {},
): string => (trimEndWhitespace ? trimOnlyLeadingNewLines(s).trimEnd() : trimOnlyLeadingAndTrailingNewlines(s));
