import { BBCodeProcessingRule } from "./BBCodeProcessingRule";

/**
 * Maps a font-size to a representation suitable as unique argument to the
 * `[size]` tag.
 *
 * If the mapper returns `undefined` (or empty string), no `[size]` tag will be
 * created.
 *
 * One possible example for such a size mapper is mapping `px` sizes to
 * plain numeric values (recommended default).
 */
export type SizeMapper = (size: string) => string | undefined;

/**
 * Pattern to match a font-size given in pixels. This is the default
 * representation with the CKEditor 5 font-feature and font-sizes configured
 * to be set as numeric values.
 *
 * Note that only sizes of up to 999 are supported to reduce possible
 * attacks towards regular expression parsing.
 */
export const sizeRegEx = /^(?<fontSize>\d{1,3})px$/i;

/**
 * Size-mapper that only accepts sizes given in pixels.
 *
 * To reduce possible attack vectors, a maximum size of 999 pixels is accepted.
 *
 * @param size - size to map to string
 */
export const defaultSizeMapper: SizeMapper = (size: string): `${number}` | undefined => {
  const match = size.match(sizeRegEx);
  if (match) {
    console.debug("TODO: Size Match Info", {
      match,
      groups: match.groups,
      jsonGroups: JSON.stringify(match.groups),
    });
    // @ts-expect-error: https://github.com/microsoft/TypeScript/issues/32098
    const { fontSize }: { fontSize: `${number}` } = match.groups;
    const nSize = Number(fontSize);
    if (Number.isNaN(nSize) || !nSize) {
      // NaN should not happen (but just as normal guard for parsing numbers)
      // !nSize prevents sizes of "0".
      return undefined;
    }
    return `${nSize}`;
  }
  return undefined;
};

/**
 * Configuration for `BBCodeSize`.
 */
export interface BBCodeSizeConfig {
  /**
   * Used for mapping detected sizes to a representation suitable for
   * use in `[size]` tag.
   */
  mapper?: SizeMapper;
}

/**
 * Processing rule for transforming a font-size style represented in HTML
 * to `[size=24]Text[/size]` in BBCode.
 */
export class BBCodeSize implements BBCodeProcessingRule {
  readonly id = "size";
  readonly tags = ["size"];

  readonly #mapper: SizeMapper;

  /**
   * Constructor with possible configuration options.
   * @param config - configuration options
   */
  constructor(config: BBCodeSizeConfig = {}) {
    const { mapper = defaultSizeMapper } = config;
    this.#mapper = mapper;
  }

  toData(element: HTMLElement, content: string): undefined | string {
    const { style } = element;
    const size = style.fontSize;

    if (size) {
      style.removeProperty("font-size");
      const mappedSize = this.#mapper(size);
      if (mappedSize) {
        return `[size=${mappedSize}]${content}[/size]`;
      }
    }

    return undefined;
  }
}

/**
 * Processing rule instance for transforming a font-size style represented in
 * HTML to `[size=24]Text[/size]` in BBCode.
 */
export const bbCodeSize = new BBCodeSize();
