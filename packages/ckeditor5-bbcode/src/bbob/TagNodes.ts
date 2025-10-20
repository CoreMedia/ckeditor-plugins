import type { TagNode } from "@bbob/plugin-helper";
import type { TagNodeTree } from "@bbob/types";
import { isEOL, N } from "@bbob/plugin-helper";

/**
 * Removes EOLs at the beginning and end, that may be a result of
 * BBCode pretty-printing.
 *
 * @param contents - contents to trim
 */
export const trimEOL = (contents: TagNodeTree): TagNode["content"] => {
  const result: TagNode["content"] = [];
  const bufferedEOLs: (typeof N)[] = [];
  const contentsArr = Array.isArray(contents) ? contents : [contents];
  for (const content of contentsArr) {
    if (typeof content === "string" && isEOL(content)) {
      // > 0: Ignore EOLs at the beginning
      if (result.length > 0) {
        bufferedEOLs.push(N);
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
