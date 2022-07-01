/**
 * This package provides a normalizer API for RichText to be able
 * to identify semantically equality.
 *
 * The `DataDiffer` contains the `DataDifferMixin` which is the entry point for
 * the CKEditor. The Mixin is used to provide the `DataDiffer` behavior on
 * CKEditor RichTextDataProcessor.
 *
 * @example
 * ```typescript
 * mix(RichTextDataProcessor, DataDifferMixin);
 * ```
 *
 * To use the added behavior the type guard can be used
 *
 * @example
 * ```typescript
 * import { isDataDiffer } from "@coremedia/ckeditor5-richtext-normalizer/DataDiffer";
 * class SomeClass {
 *   #editor: CKEditor;
 *   useTypeguardExample(): void {
 *     const { processor } = #editor.data;
 *     if (isDataDiffer(processor)) {
 *       processor.normalize(richtext);
 *     }
 *   }
 * }
 * ```
 *
 * Normalizers can be added by using the `DataDiffer` `addNormalizer` function.
 *
 * @module ckeditor5-richtext-normalizer
 */
export * from "./DataDiffer";

export * from "./NormalizedData";

export * from "./Normalizers";
