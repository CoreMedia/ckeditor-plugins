/**
 * The General RichText Support (“GRS”) ensures that any valid CoreMedia RichText,
 * especially attributes, may be loaded into CKEditor 5. It does not provide any
 * editing features, but only registers elements, attributes and attribute-values,
 * which are not yet supported by corresponding editing and/or data-processing
 * features.
 *
 * GRS is based on CKEditor 5's General HTML Support (“GHS”). GRS shares the
 * same state as GHS, which is, as of now, an experimental state.
 *
 * @module ckeditor5-coremedia-richtext-support
 */

export * from "./CoreMediaRichTextSupportConfig";
export { default as CoreMediaRichTextSupportConfig } from "./CoreMediaRichTextSupportConfig";

export * from "./CoreMediaRichTextSupportConfig";
//export { default as CoreMediaRichTextSupportConfig } from "./CoreMediaRichTextSupportConfig";

export * from "./GeneralRichTextSupport";
export { default as GeneralRichTextSupport } from "./GeneralRichTextSupport";

export * from "./ReducedMatcherPattern";
export { default as ReducedMatcherPattern } from "./ReducedMatcherPattern";

export * from "./RichTextDataFilter";
export { default as RichTextDataFilter } from "./RichTextDataFilter";
