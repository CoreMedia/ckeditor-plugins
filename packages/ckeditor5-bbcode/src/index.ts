/**
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
export { BBCodeHeading, bbCodeHeading } from "./rules/BBCodeHeading";
export { BBCodeItalic, bbCodeItalic } from "./rules/BBCodeItalic";
export { BBCodeList, bbCodeList } from "./rules/BBCodeList";
export { BBCodeListItem, bbCodeListItem } from "./rules/BBCodeListItem";
export { BBCodeParagraph, bbCodeParagraph } from "./rules/BBCodeParagraph";
export { BBCodeQuote, bbCodeQuote } from "./rules/BBCodeQuote";
export { BBCodeStrikethrough, bbCodeStrikethrough } from "./rules/BBCodeStrikethrough";
export { BBCodeTable, bbCodeTable } from "./rules/BBCodeTable";
export { BBCodeTableCell, bbCodeTableCell } from "./rules/BBCodeTableCell";
export { BBCodeTableRow, bbCodeTableRow } from "./rules/BBCodeTableRow";
export { BBCodeTableSection, bbCodeTableSection } from "./rules/BBCodeTableSection";
export { BBCodeUnderline, bbCodeUnderline } from "./rules/BBCodeUnderline";
export { BBCodeUrl, bbCodeUrl } from "./rules/BBCodeUrl";

import "./augmentation";
