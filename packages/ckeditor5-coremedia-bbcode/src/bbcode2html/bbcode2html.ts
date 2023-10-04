import html5Preset from "@bbob/preset-html5/es";
import { render } from "@bbob/html/es";
import bbob from "@bbob/core";

interface EscapeRule {
  from: string;
  to: string;
}

/**
 * Escaping applied exactly in the given order.
 */
const escapeRules: EscapeRule[] = [
  { from: "&", to: "&amp;" },
  { from: ">", to: "&gt;" },
  { from: "<", to: "&lt;" },
  { from: '"', to: "&quot;" },
];

const escapeForXml = (text: string): string => {
  let result = text;
  for (const escaping of escapeRules) {
    result = result.replace(escaping.from, escaping.to);
  }
  return result;
};

/**
 * Parses BBCode to HTML.
 */
export const bbcode2html = (bbcode: string): string => {
  const htmlEscapedBBCode = escapeForXml(bbcode);
  const processor = bbob(html5Preset());
  const processed = processor.process(htmlEscapedBBCode, { render, enableEscapeTags: true });
  // TODO: Add better logging here.
  console.log("bbcode2html", processed);
  return processed.html;
};
