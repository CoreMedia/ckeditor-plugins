/**
 * Regular expression for parsing `rgb()` and `rgba()` encoded colors. Note
 * that browsers will automatically parse any other color code representation
 * to one of the above within `CSSStyleDeclaration`. Thus, there is no need for
 * parsing `hsl()`, hex-code representations and alike.
 *
 * Regarding testing, note that JSDOM and the underlying CSSStyle library
 * behave slightly different. Unit tests should be aware of this.
 *
 * **Parseable Examples:**
 *
 * ```text
 * rgb(1, 2, 3)
 * rgb( 1 , 2, 3 )
 * rgba(1, 2, 3, 0.5)
 * ```
 *
 * **Named Groups:**
 *
 * * `red`: Red color channel (range 0 to 255).
 * * `green`: Green color channel (range 0 to 255).
 * * `blue`: Blue color channel (range 0 to 255).
 * * `alpha`: Optional alpha value (range 0.0 to 1.0).
 *
 * Note that the regular expression does not contain a range-check to enhance
 * maintainability. Thus, when accessing results from `groups`, they should be
 * validated if they fulfill the range-requirements.
 */
const rgbColorCodePattern =
  /\s*rgba?\(\s*(?<red>\d{1,3})\s*,\s*(?<green>\d{1,3})\s*,\s*(?<blue>\d{1,3})\s*(?:,\s*(?<alpha>[0-9](?:\.[0-9]*)?)\s*)?\)\s*/i;

/**
 * Represents `rgb()` and `rgba()` color format as an immutable object.
 *
 * Note that browsers (just as JSDOM, CssStyle) parse colors to `rgb()`
 * and `rgba()`
 */
export class RgbColor {
  /**
   * Scaling applied to alpha range 0.0 to 1.0 to store alpha as integer
   * within `RgbColor`. The given scale of 1,000 matches similar rounding in
   * browsers.
   *
   * Scaling is especially meant to provide more predictable results, for
   * example, when validating equality of `RgbColor` instances and follows a
   * general recommended pattern not to use floats when it can be prevented.
   */
  static readonly #alphaScale = 1000;

  /**
   * Red color component (0 to 255).
   */
  readonly red: number;

  /**
   * Green color component (0 to 255).
   */
  readonly green: number;

  /**
   * Blue color component (0 to 255).
   */
  readonly blue: number;

  /**
   * We use `1000` as precision for `alpha`. This is similar to the precision
   * browsers provide.
   */
  readonly #alpha1000?: number;

  /**
   * Constructor. Fails for invalid color components or alpha value.
   *
   * @param red - red component (integer 0 &lt;= n &lt;= 255)
   * @param green - green component (integer 0 &lt;= n &lt;= 255)
   * @param blue - blue component (integer 0 &lt;= n &lt;= 255)
   * @param alpha - optional alpha (float 0.0 &lt;= n &lt;= 1.0)
   */
  constructor(red: number, green: number, blue: number, alpha?: number) {
    const vcc = RgbColor.#validColorComponent;
    const va = RgbColor.#validAlpha;
    this.red = vcc(red);
    this.green = vcc(green);
    this.blue = vcc(blue);
    this.#alpha1000 = alpha === undefined ? undefined : Math.floor(va(alpha) * RgbColor.#alphaScale);
  }

  /**
   * Validate if the color component is valid and returns it. Fails, otherwise.
   */
  static #validColorComponent(n: number): number {
    if (!RgbColor.#isValidColorComponent(n)) {
      throw new Error(`Invalid color component: ${n} (must be integer 0 <= n <= 255).`);
    }
    return n;
  }

  /**
   * Tests if the color component is valid.
   */
  static #isValidColorComponent(n: number): boolean {
    if (Math.floor(n) !== n) {
      return false;
    }
    return n >= 0 && n <= 255;
  }

  /**
   * Validate if the alpha channel is valid and returns it. Fails, otherwise.
   */
  static #validAlpha<T extends number | undefined>(n: T): T {
    if (!RgbColor.#isValidAlpha(n)) {
      throw new Error(`Invalid alpha component: ${n} (must be float 0.0 <= n <= 1.0`);
    }
    return n;
  }

  /**
   * Tests if the alpha channel is valid.
   */
  static #isValidAlpha<T extends number | undefined>(n: T): boolean {
    return n === undefined || (n >= 0 && n <= 1);
  }

  /**
   * Tries parsing the given string if it represents an `rgb()` or
   * `rgba()` color code. If parsing is successful, returns `RgbColor`
   * representation. `undefined` if it does not match and/or contains invalid
   * parameters (such as color code components greater than 255).
   *
   * @param value - value to try to parse
   */
  static tryParseRgb(value: string): RgbColor | undefined {
    const match = rgbColorCodePattern.exec(value);
    if (!match) {
      return;
    }
    // @ts-expect-error https://github.com/microsoft/TypeScript/issues/32098
    const { red, green, blue, alpha }: { red: string; green: string; blue: string; alpha?: string } = match.groups;

    const nRed = Number(red);
    const nGreen = Number(green);
    const nBlue = Number(blue);
    const nAlpha = alpha === undefined ? undefined : Number(alpha);

    const vcc = RgbColor.#isValidColorComponent;
    const va = RgbColor.#isValidAlpha;

    if ([nRed, nGreen, nBlue].some((n) => !vcc(n))) {
      return;
    }

    if (!va(nAlpha)) {
      return;
    }
    return new RgbColor(nRed, nGreen, nBlue, nAlpha);
  }

  /**
   * Signals, if any alpha channel has been set.
   */
  get hasAlpha(): boolean {
    return this.#alpha1000 !== undefined;
  }

  /**
   * Invokes the given `onSet` callback, when alpha is set.
   * Returns `undefined`, otherwise.
   *
   * @param onSet will be invoked with current alpha value when set
   */
  #ifAlpha<T = number>(onSet: (alpha: number) => T): T | undefined {
    const alpha1000 = this.#alpha1000;
    if (alpha1000 === undefined) {
      return undefined;
    }
    return onSet(alpha1000 / RgbColor.#alphaScale);
  }

  /**
   * Get alpha, if set. The alpha range is from 0.0 to 1.0 including.
   */
  get alpha(): number | undefined {
    return this.#ifAlpha((a) => a);
  }

  /**
   * Get alpha, if set. The alpha range is from 0 to 255 including.
   * A value of 255 represents `alpha` = 1.0.
   */
  get alpha255(): number | undefined {
    return this.#ifAlpha((a) => Math.floor(a * 255));
  }

  /**
   * Transforms the color to its hexadecimal representation such as `#010aff`.
   *
   * A possibly set alpha channel is ignored.
   */
  get hex(): `#${string}` {
    const r = this.red;
    const g = this.green;
    const b = this.blue;
    return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
  }

  /**
   * Transforms the color to its hexadecimal representation such as `#010af0a0`
   *
   * An unset alpha will default to `FF` for full opacity.
   */
  get hexa(): `#${string}` {
    const hexRgb = this.hex;
    const alpha255 = this.alpha255 ?? 255;
    const alphaString = ((1 << 8) | alpha255).toString(16).slice(1);
    return `${hexRgb}${alphaString}`;
  }

  /**
   * Transforms the color to its hexadecimal representation.
   *
   * Depending on if the alpha channel is set or not, uses representation as
   * `hex` or `hexa`.
   */
  toHex(): `#${string}` {
    return this.hasAlpha ? this.hexa : this.hex;
  }

  /**
   * Transforms the color to its `rgb()` representation.
   *
   * Any possibly set alpha channel is ignored.
   */
  get rgb(): `rgb(${string})` {
    const r = this.red;
    const g = this.green;
    const b = this.blue;
    return `rgb(${r},${g},${b})`;
  }

  /**
   * Transforms the color to its `rgba()` representation.
   *
   * An unset alpha will default to `1` for full opacity.
   */
  get rgba(): `rgba(${string})` {
    const r = this.red;
    const g = this.green;
    const b = this.blue;
    const a = this.alpha ?? 1;
    return `rgba(${r},${g},${b},${a})`;
  }

  /**
   * Transforms the color to its `rgb()` or `rgba()` representation.
   *
   * Depending on if the alpha channel is set or not, uses representation as
   * `rgb` or `rgba`.
   */
  toRgb(): `rgb(${string})` | `rgba(${string})` {
    return this.hasAlpha ? this.rgba : this.rgb;
  }

  toString(): `rgb(${string})` | `rgba(${string})` {
    return this.toRgb();
  }
}

/**
 * Creates an instance of `RgbColor`.
 *
 * @param r - red channel
 * @param g - green channel
 * @param b - blue channel
 * @param a - optional alpha channel (range 0 to 1 including)
 */
export const rgb = (r: number, g: number, b: number, a?: number) => new RgbColor(r, g, b, a);
