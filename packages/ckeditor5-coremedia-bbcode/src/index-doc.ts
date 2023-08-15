/**
 * This plugin grants conversion of BBCode to the CKEditor data model
 * as well as conversion from CKEditor data model to BBCode.
 *
 * @module ckeditor5-coremedia-bbcode
 */

export * from "./BBCode";
export { default as BBCode } from "./BBCode";

export { default as BBCodeDataProcessor } from "./BBCodeDataProcessor";

export * as bbcode2html from "./bbcode2html/index-doc";
export * as html2bbcode from "./html2bbcode/index-doc";
