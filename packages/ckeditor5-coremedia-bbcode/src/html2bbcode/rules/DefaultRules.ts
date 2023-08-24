import { boldRule } from "./Bold";
import { italicRule } from "./Italic";
import { underlineRule } from "./Underline";

export interface HTML2BBCodeRule {
  id: string;
  toData: (node: Node, content: string) => string | undefined;
}

export const defaultRules: HTML2BBCodeRule[] = [boldRule, italicRule, underlineRule];
