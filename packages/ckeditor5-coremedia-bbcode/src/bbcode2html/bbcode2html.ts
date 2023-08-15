import bbobHTML from "@bbob/html/es";
import presetHTML5 from "@bbob/preset-html5";

/**
 * Parses BBCode to HTML.
 */
export const bbcode2html = (bbcode: string): string => {
  return bbobHTML(bbcode, presetHTML5());
};
