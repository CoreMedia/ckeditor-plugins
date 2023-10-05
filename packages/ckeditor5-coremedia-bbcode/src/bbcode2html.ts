import html5Preset from "@bbob/preset-html5/es";
import { render } from "@bbob/html/es";
import bbob from "@bbob/core";
import { bbCodeLogger } from "./BBCodeLogger";

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

const bbobProcessor = bbob(html5Preset());

/**
 * Parses BBCode to HTML.
 */
export const bbcode2html = (bbcode: string, allowedTags?: string[]): string => {
  const logger = bbCodeLogger;
  const htmlEscapedBBCode = escapeForXml(bbcode);
  const processed = bbobProcessor.process(htmlEscapedBBCode, {
    render,
    enableEscapeTags: true,
    onlyAllowTags: allowedTags,
  });
  if (logger.isDebugEnabled()) {
    logger.debug("bbcode2html done.", {
      html: processed.html,
      messages: processed.messages,
      allowedTags,
    });
  }
  return processed.html;
};
