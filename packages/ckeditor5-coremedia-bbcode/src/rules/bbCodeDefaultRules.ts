import { BBCodeProcessingRule } from "./BBCodeProcessingRule";
import { bbCodeBold } from "./BBCodeBold";
import { bbCodeHeading } from "./BBCodeHeading";
import { bbCodeItalic } from "./BBCodeItalic";
import { bbCodeParagraph } from "./BBCodeParagraph";
import { bbCodeStrikethrough } from "./BBCodeStrikethrough";
import { bbCodeUnderline } from "./BBCodeUnderline";
import { bbCodeUrl } from "./BBCodeUrl";

export const bbCodeDefaultRules: BBCodeProcessingRule[] = [
  bbCodeBold,
  bbCodeHeading,
  bbCodeItalic,
  bbCodeParagraph,
  bbCodeStrikethrough,
  bbCodeUnderline,
  bbCodeUrl,
];
