/**
 * This package provides a normalizer API for data to be able
 * to identify semantically equality.
 *
 * The `DataNormalizer` contains the `DataNormalizerMixin` which is the entry point for
 * the CKEditor. The Mixin is used to provide the `DataNormalizer` behavior on
 * CKEditor RichTextDataProcessor.
 *
 * @example
 * ```typescript
 * mix(RichTextDataProcessor, DataNormalizerMixin);
 * ```
 *
 * To use the added behavior the type guard can be used
 *
 * @example
 * ```typescript
 * import { isDataNormalizer } from "@coremedia/ckeditor5-data-normalization/DataNormalizer";
 * class SomeClass {
 *   #editor: CKEditor;
 *   useTypeguardExample(): void {
 *     const { processor } = #editor.data;
 *     if (isDataNormalizer(processor)) {
 *       processor.normalize(richtext);
 *     }
 *   }
 * }
 * ```
 *
 * Normalizers can be added by using the `DataNormalizer` `addNormalizer` function.
 *
 * @module ckeditor5-data-normalization
 */
export * from "./DataNormalizer";

export * from "./NormalizedData";

export * from "./Normalizers";
