/**
 * General utilities, e.g., for TypeScript Support.
 *
 * @module ckeditor5-common
 */

export { type Raw, isRaw } from "./AdvancedTypes";
export { type RequireSelected } from "./RequireSelected";
export { type RequiredNonNull, requireNonNulls, type RequiredNonNullPropertiesMissingError } from "./RequiredNonNull";
export { capitalize } from "./Strings";
export { createClassicEditorWithLicense, createEditorWithLicense } from "./createEditorWithLicense";
export { IncompatibleInternalApiUsageError } from "./IncompatibleInternalApiUsageError";
