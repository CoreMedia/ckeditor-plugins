/**
 * Provides extensions to CKEditor's Content-Clipboard Feature.
 *
 * @module ckeditor5-coremedia-content-clipboard
 */
export * as integrations from "./integrations/index-doc";

/**
 * Provides paste functionality for the content-clipboard plugin.
 */
export * as paste from "./paste/index-doc";

export type * as lang from "./lang/index-doc";

export * from "./ContentClipboard";
export { default as ContentClipboard } from "./ContentClipboard";

export { default as ContentClipboardEditing } from "./ContentClipboardEditing";

export * from "./ContentClipboardMarkerDataUtils";

export * from "./ContentInputDataCache";
export { default as ContentInputDataCache } from "./ContentInputDataCache";

export * from "./ContentMarkers";

export * from "./ContentToModelRegistry";
export { default as ContentToModelRegistry } from "./ContentToModelRegistry";

export * from "./converters";

export { default as DataToModelMechanism } from "./DataToModelMechanism";

export { default as MarkerRepositionUtil } from "./MarkerRepositionUtil";
