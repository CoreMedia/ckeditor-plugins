import { bbCodeLogger } from "./BBCodeLogger";
import { ckeditor5Preset } from "./bbob/ckeditor5Preset";
import { renderHtmlDom } from "./bbob/renderHtmlDom";

const { default: bbob } = await import("@bbob/core");

const bbobProcessor = bbob(ckeditor5Preset());

/**
 * Processes BBCode.
 *
 * Visible for testing only.
 *
 * @param bbcode - BBCode to process
 * @param allowedTags - allowed tags
 */
export const processBBCode = (bbcode: string, allowedTags?: string[]): ReturnType<ReturnType<typeof bbob>["process"]> =>
  bbobProcessor.process(bbcode, {
    render: renderHtmlDom,
    enableEscapeTags: true,
    onlyAllowTags: allowedTags,
    onError: (error) =>
      bbCodeLogger.error(
        `Failure while processing BBCode (${error.tagName} at ${error.lineNumber}:${error.columnNumber}): ${error.toString()}`,
      ),
  });

/**
 * BBob only supports LF as line separators
 * (see <https://github.com/JiLiZART/BBob/issues/212>). Thus, we need to
 * normalize the BBCode prior to parsing it.
 *
 * @param bbCode -- BBCode to normalize newline characters in
 */
const normalizeLineSeparators = (bbCode: string): string => {
  if (!bbCode) {
    return "";
  }
  return bbCode.replaceAll("\r\n", "\n").replaceAll("\r", "\n");
};

/**
 * Parses BBCode to HTML.
 *
 * @param bbcode - BBCode to process
 * @param allowedTags - allowed tags
 */
export const bbcode2html = (bbcode: string, allowedTags?: string[]): string => {
  const normalizedBBCode = normalizeLineSeparators(bbcode);
  const processed = processBBCode(normalizedBBCode, allowedTags);
  if (bbCodeLogger.isDebugEnabled()) {
    bbCodeLogger.debug("bbcode2html done.", {
      bbcode,
      html: processed.html,
      messages: processed.messages,
      allowedTags,
    });
  }
  return processed.html;
};
