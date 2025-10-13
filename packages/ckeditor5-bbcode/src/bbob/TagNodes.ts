import type { N, TagNode } from "@bbob/plugin-helper/es";
import { isEOL } from "@bbob/plugin-helper/es";

/**
 * Removes EOLs at the beginning and end, that may be a result of
 * BBCode pretty-printing.
 *
 * @param contents - contents to trim
 */
export const trimEOL = (contents: TagNode["content"]): TagNode["content"] => {
  const result: TagNode["content"] = [];
  const bufferedEOLs: (typeof N)[] = [];
  for (const content of contents ?? []) {
    if (isEOL(content)) {
      // > 0: Ignore EOLs at the beginning
      if (result.length > 0) {
        bufferedEOLs.push(content);
      }
    } else {
      // Push any EOLs collected up to now.
      result.push(...bufferedEOLs);
      result.push(content);
      bufferedEOLs.length = 0;
    }
  }
  // Ignoring any bufferedEOLs at the end implements the "trim at end"
  // feature.
  return result;
};
