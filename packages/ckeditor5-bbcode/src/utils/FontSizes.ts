/**
 * Configuration entry for font-sizes.
 */
export interface FontSizeConfiguration {
  /**
   * Signal, if a given extracted size argument (as denoted by
   * `[size=number]`) is represented by this configuration.
   *
   * @param size - size as number
   */
  matchesData(size: number): boolean;

  /**
   * Chooses a dedicated number to represent this size within the BBCode data.
   * The key requirement is, that the generated number evaluated to `true` when
   * checked via `matchesData`. A required side aspect is, that only one entry
   * in `fontSizes` matches this generated number.
   */
  readonly numeric: number;

  /**
   * Representation as class attribute in data view layer (HTML).
   */
  readonly className: string;
}

/**
 * Range of font sizes denoted in BBCode covered by a given font-size.
 */
export interface FontSizeRange {
  /**
   * Number to use in `toData` mapping to represent a given font size.
   */
  normalized: number;
  /**
   * Lower bound (inclusive) for incoming data, that match the
   * given font-size.
   */
  lowerInclusive: number;
  /**
   * Upper bound (exclusive) for incoming data, that match the
   * given font-size.
   */
  upperExclusive: number;
}

/**
 * Normalized numeric representation for the "normal" size, i.e., that
 * won't be represented by an extra class within data view layer in
 * CKEditor 5.
 */
export const normalSize = 100;

/**
 * Supported font size ranges.
 */
export const fontSizeRanges: Record<string, FontSizeRange> = {
  tiny: {
    normalized: 70,
    lowerInclusive: Number.MIN_SAFE_INTEGER,
    upperExclusive: 78,
  },
  small: {
    normalized: 85,
    lowerInclusive: 78,
    upperExclusive: 93,
  },
  normal: {
    normalized: normalSize,
    lowerInclusive: 93,
    upperExclusive: 120,
  },
  big: {
    normalized: 140,
    lowerInclusive: 120,
    upperExclusive: 160,
  },
  huge: {
    normalized: 180,
    lowerInclusive: 160,
    upperExclusive: Number.MAX_SAFE_INTEGER,
  },
};

/**
 * Considers, if a given size is within the configured range.
 *
 * Special handling exists for `Number.MAX_SAFE_INTEGER` given as upper bound:
 * It will assume to match any value that just fulfills the lower bound.
 *
 * @param size - the font numeric font size
 * @param range - the range to validate the size against
 */
const sizeWithinRange = (size: number, range: FontSizeRange): boolean =>
  range.lowerInclusive <= size && (size < range.upperExclusive || range.upperExclusive >= Number.MAX_SAFE_INTEGER);

/**
 * Configuration of supported font-sizes.
 */
export const fontSizes: FontSizeConfiguration[] = Object.entries(fontSizeRanges).map(
  ([name, range]): FontSizeConfiguration => {
    const matchesData: FontSizeConfiguration["matchesData"] = (size: number) => sizeWithinRange(size, range);
    const numeric: FontSizeConfiguration["numeric"] = range.normalized;
    // text-tiny, text-small, etc. match the default classes as used by
    // the CKEditor 5 Font Size Plugin.
    const className: FontSizeConfiguration["className"] = `text-${name}`;
    return {
      matchesData,
      numeric,
      className,
    };
  },
);
