/**
 * A normalizer to apply prior to calculate the difference of
 * two data values.
 */
import { isNormalizedData, NormalizedData, toNormalizedData } from "./NormalizedData";
import { isRaw } from "@coremedia/ckeditor5-common/AdvancedTypes";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";

/**
 * A normalizer for data strings.
 */
export type Normalizer = (input: string) => string;

/**
 * For convenience, we support a bunch of types to `areEqual`, especially
 * `undefined` and `null`.
 */
type AreEqualInputType = string | NormalizedData | undefined | null;

/**
 * Property to hold normalizers.
 */
const Normalizers = Symbol("normalizers");

/**
 * Prioritized normalizer map.
 */
interface NormalizerMap {
  [priority: number]: Normalizer[];
}

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
   * List of normalizers.
   */
  [Normalizers]?: NormalizerMap;

  /**
   * Adds a normalizer to apply prior to comparing both data values
   * at `addNormalizer`.
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
   * @param priority - priority of the normalizer, defaults to 0. Normalizers
   * with lower priority are executed first. Normalizers of same priority will
   * be executed in the given order in which they got added.
   */
  addNormalizer(normalizer: Normalizer, priority?: number): void;

  /**
   * Normalize the given value according to the given options. Already
   * normalized strings will be returned unmodified.
   *
   * @param value - value to normalize
   */
  normalize(value: string | NormalizedData): NormalizedData;

  /**
   * Signals if the given values are equivalent, applying
   * configured normalizers by `addNormalizer`.
   *
   * Ideally, this method should signal equivalence, if both representations
   * are semantically equivalent. If in doubt, values, which are not
   * strictly equal, are considered different. In other words this means: If
   * there is no corresponding normalizer to remove an irrelevant difference,
   * the values will be considered different.
   *
   * To reduce normalization overhead for repeated comparison, you may want to
   * pre-process strings with `normalize` method and store them for later.
   *
   * If both values represent normalized value, there is no difference to
   * check for strict equivalence instead:
   *
   * ```
   * normalizedValue1 === normalizedValue2
   * ```
   *
   * @param value1 - first value to compare
   * @param value2 - second value to compare
   * @returns if the given values are considered equivalent after normalization or not
   */
  areEqual(value1: AreEqualInputType, value2: AreEqualInputType): boolean;
}

/**
 * Validates if the given value represents a `DataDiffer`.
 *
 * @param value - value to validate
 */
export const isDataDiffer = (value: unknown): value is DataDiffer => {
  return (
    typeof value === "object" &&
    !!value &&
    (mixinIdentifier in value ||
      (isRaw<DataDiffer>(value, "addNormalizer", "normalize", "areEqual") &&
        typeof value.addNormalizer === "function" &&
        typeof value.normalize === "function" &&
        typeof value.areEqual === "function"))
  );
};

/**
 * Token to quickly identify matching mixin usages in type-guard.
 */
const mixinIdentifier: unique symbol = Symbol("DataDifferMixin");

/**
 * Type for holding the mixin token.
 */
type MixinTokenType = { [mixinIdentifier]: void };

/**
 * Mixin token to apply.
 */
const MixinToken: MixinTokenType = {
  [mixinIdentifier]: undefined,
};

/**
 * Some logging should help to understand the normalization process.
 */
// Possibly a good idea, providing this logging as mixin? Then Mixins
// could use logging as provided by their "mixed in class".
const dataDifferLogger = LoggerProvider.getLogger("DataDiffer");

/**
 * Mixin providing the data differ functionality.
 */
export const DataDifferMixin: DataDiffer & MixinTokenType = {
  ...MixinToken,

  addNormalizer(normalizer: Normalizer, priority = 0): void {
    if (!this[Normalizers]) {
      // First normalizer added.
      this[Normalizers] = { [priority]: [normalizer] };
    } else {
      // Add normalizer to existing.
      const prioritized = this[Normalizers][priority];
      if (!!prioritized) {
        // Priority already in use. Append.
        prioritized.push(normalizer);
      } else {
        // New priority.
        this[Normalizers][priority] = [normalizer];
      }
    }
  },

  normalize(value: string | NormalizedData): NormalizedData {
    if (isNormalizedData(value)) {
      return value;
    }
    const allNormalizers: NormalizerMap = this[Normalizers] || {};
    const priorities = Object.keys(allNormalizers)
      .map((k): number => Number(k))
      .sort();

    let result = value;

    dataDifferLogger.debug("Going to normalize data.", { data: result });

    priorities.forEach((priority) => {
      allNormalizers[priority]?.forEach((n) => (result = n(result)));
      dataDifferLogger.debug(`Applied normalizers with priority ${priority}.`, { data: result });
    });

    dataDifferLogger.debug("Finished normalizing data.", { data: result });

    return toNormalizedData(result);
  },

  areEqual(value1: AreEqualInputType, value2: AreEqualInputType): boolean {
    if (typeof value1 !== "string" || typeof value2 !== "string") {
      return value1 === value2;
    }
    const normalized1 = this.normalize(value1);
    const normalized2 = this.normalize(value2);
    return normalized1 === normalized2;
  },
};
