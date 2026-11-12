/**
 * Provides sanitation for CoreMedia Rich Text 1.0 to guarantee, that contents
 * can be stored on server at best effort, even if data-processing did not
 * apply all required mappings for elements found in data view.
 *
 * @packageDocumentation
 * @category Virtual
 */

export * from "./AttributeContent";
export * from "./AttributeDefinitionConfig";
export * from "./ElementConfig";
export * from "./ElementContent";
export * from "./RichTextDtd";
export * from "./RichTextSanitizer";
export * from "./SanitationListener";
export * from "./TrackingSanitationListener";
