export const removeLeadingAndTrailingNewlines = (s: string): string => s.replace(/(^[\n\r]*|[\n\r]*$)/g, "");
