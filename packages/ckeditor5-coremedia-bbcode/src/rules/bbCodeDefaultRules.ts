import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { bbCodeBold } from "./BBCodeBold";
import { bbCodeHeading } from "./BBCodeHeading";
import { bbCodeItalic } from "./BBCodeItalic";
import { bbCodeParagraph } from "./BBCodeParagraph";
import { bbCodeStrikethrough } from "./BBCodeStrikethrough";
import { bbCodeUnderline } from "./BBCodeUnderline";
import { bbCodeUrl } from "./BBCodeUrl";
import { bbCodeQuote } from "./BBCodeQuote";
import { bbCodeCode } from "./BBCodeCode";
import { bbCodeList } from "./BBCodeList";
import { bbCodeListItem } from "./BBCodeListItem";
import { bbCodeTable } from "./BBCodeTable";
import { bbCodeTableCell } from "./BBCodeTableCell";
import { bbCodeTableRow } from "./BBCodeTableRow";
import { bbCodeTableSection } from "./BBCodeTableSection";
import { bbCodeColor } from "./BBCodeColor";

export const bbCodeDefaultRules: BBCodeProcessingRule[] = [
  bbCodeBold,
  bbCodeCode,
  bbCodeColor,
  bbCodeHeading,
  bbCodeItalic,
  bbCodeList,
  bbCodeListItem,
  bbCodeParagraph,
  bbCodeQuote,
  bbCodeStrikethrough,
  bbCodeTable,
  bbCodeTableCell,
  bbCodeTableRow,
  bbCodeTableSection,
  bbCodeUnderline,
  bbCodeUrl,
];
