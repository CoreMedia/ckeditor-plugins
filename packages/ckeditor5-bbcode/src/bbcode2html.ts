import bbob from "@bbob/core/es";
import { bbCodeLogger } from "./BBCodeLogger";
import { ckeditor5Preset } from "./bbob/ckeditor5Preset";
import { renderHtmlDom } from "./bbob/renderHtmlDom";

const bbobProcessor = bbob(ckeditor5Preset());

/**
 * Parses BBCode to HTML.
 */
export const bbcode2html = (bbcode: string, allowedTags?: string[]): string => {
  const logger = bbCodeLogger;
  const processed = bbobProcessor.process(bbcode, {
    render: renderHtmlDom,
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
