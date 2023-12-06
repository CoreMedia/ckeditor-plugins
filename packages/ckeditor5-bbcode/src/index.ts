/**
 * This plugin grants conversion of BBCode to the CKEditor data model
 * as well as conversion from CKEditor data model to BBCode.
 *
 * @module ckeditor5-bbcode
 */

export { BBCode } from "./BBCode";
export { BBCodeDataProcessor, ifBBCodeDataProcessor, isBBCodeDataProcessor } from "./BBCodeDataProcessor";

export { bbCodeDefaultRules } from "./rules/bbCodeDefaultRules";
export type { BBCodeProcessingRule } from "./rules/BBCodeProcessingRule";

export {
  BBCodeBold,
  bbCodeBold,
  defaultIsBold,
  type BBCodeBoldConfig,
  type IsBoldFontWeight,
} from "./rules/BBCodeBold";
export {
  BBCodeCode,
  bbCodeCode,
  defaultIsUnset,
  defaultLanguageByClass,
  defaultPlainTextToken,
  type BBCodeCodeConfig,
  type IsUnset,
  type LanguageByClass,
} from "./rules/BBCodeCode";
export {
  BBCodeColor,
  bbCodeColor,
  defaultColorMapper,
  type BBCodeColorConfig,
  type ColorMapper,
} from "./rules/BBCodeColor";
export { BBCodeHeading, bbCodeHeading } from "./rules/BBCodeHeading";
export { BBCodeImg, bbCodeImg } from "./rules/BBCodeImg";
export { BBCodeItalic, bbCodeItalic } from "./rules/BBCodeItalic";
export { BBCodeList, bbCodeList } from "./rules/BBCodeList";
export { BBCodeListItem, bbCodeListItem } from "./rules/BBCodeListItem";
export { BBCodeParagraph, bbCodeParagraph } from "./rules/BBCodeParagraph";
export { BBCodeQuote, bbCodeQuote } from "./rules/BBCodeQuote";
export { BBCodeSize, bbCodeSize } from "./rules/BBCodeSize";
export { BBCodeStrikethrough, bbCodeStrikethrough } from "./rules/BBCodeStrikethrough";
export { BBCodeUnderline, bbCodeUnderline } from "./rules/BBCodeUnderline";
export { BBCodeUrl, bbCodeUrl } from "./rules/BBCodeUrl";

import "./augmentation";
