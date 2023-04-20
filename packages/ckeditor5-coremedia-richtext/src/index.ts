/**
 * @module ckeditor5-coremedia-richtext
 */

export { default as CoreMediaRichText } from "./CoreMediaRichText";
export {
  COREMEDIA_RICHTEXT_CONFIG_KEY,
  CommonCoreMediaRichTextConfig,
  CompatibilityConfig,
  CompatibilityKey,
  LatestCoreMediaRichTextConfig,
  V10CoreMediaRichTextConfig,
  compatibilityKeys,
  default as CoreMediaRichTextConfig,
  defaultCoreMediaRichTextConfig,
} from "./CoreMediaRichTextConfig";
export { default as RichTextDataProcessor } from "./RichTextDataProcessor";
export { default as RichTextXmlWriter } from "./RichTextXmlWriter";
export { default as ToDataProcessor } from "./ToDataProcessor";
export { COREMEDIA_RICHTEXT_1_0_DTD, declareCoreMediaRichText10Entities } from "./Entities";
export { Strictness, defaultStrictness } from "./Strictness";

/*
 * `integrations/`
 */

export { LinkIntegration } from "./integrations/LinkIntegration";

/*
 * `rules/`
 */

export { ReplaceByChildrenConfig, replaceByChildren } from "./rules/ReplaceByChildren";
export { ReplaceElementByElementConfig, replaceElementByElement } from "./rules/ReplaceElementByElement";
export {
  ReplaceElementByElementAndClassConfig,
  replaceElementByElementAndClass,
} from "./rules/ReplaceElementByElementAndClass";
export {
  ReplaceHeadingsByElementAndClassConfig,
  replaceHeadingsByElementAndClass,
} from "./rules/ReplaceHeadingsByElementAndClass";

import "./augmentation";
