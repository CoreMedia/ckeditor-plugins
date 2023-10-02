import { boldRule } from "./Bold";
import { italicRule } from "./Italic";
import { underlineRule } from "./Underline";
import { anchorRule } from "./Anchor";
import { HTML2BBCodeRule } from "./HTML2BBCodeRule";
import { paragraphRule } from "./Paragraph";
import { headingRule } from "./Heading";

export const defaultRules: HTML2BBCodeRule[] = [
  anchorRule,
  boldRule,
  headingRule,
  italicRule,
  paragraphRule,
  underlineRule,
];
