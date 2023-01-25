import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/Rule";
import { headingElements } from "./HeadingElements";
import { languageAttributes } from "./LanguageAttributes";
import { basicInlineElements } from "./BasicInlineElements";
import { codeElements } from "./CodeElements";
import { divElements } from "./DivElements";
import { tableElements } from "./TableElements";
import { anchorElements } from "./AnchorElements";
import { imageElements } from "./ImageElements";
import { suppressedElements } from "./SuppressedElements";
import { xDiffElements } from "./XDiffElements";

/**
 * Default rules for `RichTextDataProcessor`. May be extended or overridden
 * by custom plugins or configuration.
 *
 * **Includes:**
 *
 * * `basicInlineElements`
 * * `codeElements`
 * * `divElements`
 * * `headingElements`
 * * `languageAttributes`
 * * `tableElements`
 * * `xLinkAttributesFallback`
 */
export const defaultRules: RuleConfig[] = [
  anchorElements,
  ...basicInlineElements,
  codeElements,
  divElements,
  headingElements,
  imageElements,
  languageAttributes,
  ...suppressedElements,
  xDiffElements,
  ...tableElements,
];
