/**
 * A normalizer to apply prior to calculate the difference of
 * two data values.
 */
export type Normalizer = (input: string) => string;

/**
 * Provides a way to get a difference of given data values. Typical usage is,
 * when two given data values are considered equivalent and a difference
 * when passing processing as workaround for
 * https://github.com/ckeditor/ckeditor5/issues/11900:
 *
 * ```text
 * data (start) →
 *   data view →
 *   model →
 *   editing view →
 *   model →
 *   data view →
 *   data (and back again)
 * ```
 *
 * should not be perceived as difference, e.g., to see if updating data
 * on a server is required.
 *
 * As such equivalence is best decided by data-processors, this interface
 * is meant to be provided as mixin for affected data-processors.
 *
 * @example Markdown
 * The following should be equivalent and just depends on the taken processing
 * route within the data-processor.
 *
 * ```markdown
 * # Heading 1
 * ```
 *
 * versus
 *
 * ```markdown
 * Heading 1
 * =========
 * ```
 *
 * **Performance:** Data Differs are meant to provide lightweight means of
 * comparing data. Strictly speaking, the generated data view should be compared
 * if both provide an equal result. This again would greatly decrease
 * performance as mappings from data to data view may be expensive. That is why
 * implementations should signal a difference, if in doubt. For example, if
 * an XML differ is not capable of ignoring attribute order, a different
 * attribute order should signal a difference.
 */
export interface DataDiffer {
  /**
   * Adds a normalizer to apply prior to comparing both data values
   * at `addNormalizer`.
   *
   * Normalizers should not rely on any given order in which they
   * are applied.
   *
   * Normalizers are typically added by data-processor implementations.
   *
   * Note, that normalizers are only meant for comparison via `areDifferent`.
   * This means, that the normalization result may not represent valid data.
   *
   * @example Stripping Namespace Declarations
   *
   * Differences in XML namespace declarations may be considered irrelevant
   * and thus, all such declarations are removed for comparison. This normalized
   * value will be invalid XML, but still be suitable for comparison.
   *
   * @param normalizer - the normalizer to be called
   */
  addNormalizer(normalizer: Normalizer): void;

  /**
   * Signals if the given values are not equivalent, applying
   * configured normalizers by `addNormalizer`.
   *
   * Ideally, this method should signal equivalence, if both representations
   * are semantically equivalent. If in doubt, values, which are not
   * strictly equal, are considered different. In other words this means: If
   * there is no corresponding normalizer to remove an irrelevant difference,
   * the values will be considered different.
   *
   * @param value1 - first value to compare
   * @param value2 - second value to compare
   * @returns if the given values are considered equivalent after normalization
   */
  areDifferent(value1: string, value2: string): boolean;
}

/**
 * Mixin providing the data differ functionality.
 */
export class DataDifferMixin implements DataDiffer {
  #normalizers: Normalizer[] = [];

  addNormalizer(normalizer: Normalizer): void {
    this.#normalizers.push(normalizer);
  }

  /**
   * Normalize the given value according to the given options.
   *
   * @param value - value to normalize
   */
  #normalize(value: string): string {
    let result = value;
    this.#normalizers.forEach((n) => (result = n(result)));
    return result;
  }

  areDifferent(value1: string, value2: string): boolean {
    const normalized1 = this.#normalize(value1);
    const normalized2 = this.#normalize(value2);
    return normalized1 !== normalized2;
  }
}
