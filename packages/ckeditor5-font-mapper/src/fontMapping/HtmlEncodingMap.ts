/**
 * Minimum replacement map for custom mapping. As we decode the HTML prior to replacement we need to ensure
 * also for custom mappings, that the encoded characters are restored.
 */
export const htmlEncodingMap = new Map<number, string>([
  [38, "&amp;"],
  [60, "&lt;"],
  [62, "&gt;"],
]);
