/**
 * @module ckeditor5-coremedia-richtext
 */

export { default as CoreMediaRichText } from "./CoreMediaRichText";
export {
  COREMEDIA_RICHTEXT_CONFIG_KEY,
  compatibilityKeys,
  defaultCoreMediaRichTextConfig,
} from "./CoreMediaRichTextConfig";
export type {
  default as CoreMediaRichTextConfig,
  CommonCoreMediaRichTextConfig,
  CompatibilityConfig,
  CompatibilityKey,
  LatestCoreMediaRichTextConfig,
  V10CoreMediaRichTextConfig,
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

export { replaceByChildren, type ReplaceByChildrenConfig } from "./rules/ReplaceByChildren";
export { replaceElementByElement, type ReplaceElementByElementConfig } from "./rules/ReplaceElementByElement";
export {
  replaceElementByElementAndClass,
  type ReplaceElementByElementAndClassConfig,
} from "./rules/ReplaceElementByElementAndClass";
export {
  replaceHeadingsByElementAndClass,
  type ReplaceHeadingsByElementAndClassConfig,
} from "./rules/ReplaceHeadingsByElementAndClass";
export {
  mapArtificialXLinkRole,
  preProcessAnchorElement,
  type HTMLAnchorElementPreprocessor,
} from "./rules/AnchorElements";

import "./augmentation";
