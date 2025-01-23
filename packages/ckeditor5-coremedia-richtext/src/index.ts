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
export { default as RichTextDataProcessor, isRichTextDataProcessor } from "./RichTextDataProcessor";
export { default as RichTextXmlWriter } from "./RichTextXmlWriter";
export { default as ToDataProcessor } from "./ToDataProcessor";
export { COREMEDIA_RICHTEXT_1_0_DTD, declareCoreMediaRichText10Entities } from "./Entities";
export { Strictness, defaultStrictness } from "./Strictness";
export { namespaces } from "./Namespaces";

/*
 * `integrations/`
 */

export { LinkIntegration } from "./integrations/LinkIntegration";

/*
 * `rules/`
 */

export { replaceByChildren, type ReplaceByChildrenConfig } from "./rules/ReplaceByChildren";
export { replaceElementByElement, type ReplaceElementByElementConfig } from "./rules/ReplaceElementByElement";
export { replaceByElementAndClassBackAndForth } from "./rules/ReplaceBy";
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
export { stripFixedAttributes } from "./rules/FixedAttributes";

import "./augmentation";
