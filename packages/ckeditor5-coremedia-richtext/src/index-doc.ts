/**
 * This plugin is required to edit CoreMedia Richtext 1.0,
 * an XML format, which provides a subset of XHTML features.
 *
 * It grants conversion of CoreMedia RichText 1.0 to the CKEditor data model
 * as well as conversion from CKEditor data model to CoreMedia RichText.
 *
 * @module ckeditor5-coremedia-richtext
 */

export * as legacy from "./legacy/index-doc";

export * from "./Constants";

export * from "./CoreMediaRichText";
export { default as CoreMediaRichText } from "./CoreMediaRichText";

export * from "./CoreMediaRichTextConfig";
export { default as CoreMediaRichTextConfig } from "./CoreMediaRichTextConfig";

export * from "./RichTextDataProcessor";
export { default as RichTextDataProcessor } from "./RichTextDataProcessor";

export * from "./RichTextSchema";
export { default as RichTextSchema } from "./RichTextSchema";

export * from "./RichTextXmlWriter";
export { default as RichTextXmlWriter } from "./RichTextXmlWriter";

export * from "./ToDataProcessor";
export { default as ToDataProcessor } from "./ToDataProcessor";
export { COREMEDIA_RICHTEXT_1_0_DTD } from "./Entities";
export { declareCoreMediaRichText10Entities } from "./Entities";
