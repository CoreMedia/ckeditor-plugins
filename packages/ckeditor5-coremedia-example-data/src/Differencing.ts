/**
 * Supported attributes in XDIFF Namespace.
 */
export type XDiffAttribute = "class" | "id" | "previous" | "next" | "changetype" | "changes";

/**
 * Set of attributes in XDIFF Namespace.
 */
export type XDiffAttributes = {
  [key in XDiffAttribute]?: string;
};

/**
 * Supported difference types.
 */
export type XDiffType = "added" | "removed" | "changed" | "conflict";

/**
 * Configuration for generating `<xdiff:span>`.
 */
export interface XDiffSpanConfig {
  /**
   * The type of the difference.
   */
  type: XDiffType;
  /**
   * An optional string describing applied/detected changes. Expected to be
   * passed as raw HTML in configuration. Will be transformed to encoded HTML
   * in attribute value.
   */
  changes?: string;
  /**
   * If this is the last difference to add, thus, no subsequent `next`
   * reference shall be added.
   */
  endOfDifferences?: boolean;
}

/**
 * Shortcut, to mark changes directly as _end of differences_.
 * This prevents that the difference-ID increases on each call
 * to `xdiff`.
 */
export const EOD: Pick<XDiffSpanConfig, "endOfDifferences"> = {
  endOfDifferences: true,
};

/**
 * Utility function to escape HTML within changes string.
 */
const htmlEscape = (str: string): string => {
  return str
    .replace(/&/g, `&amp;`)
    .replace(/'/g, `&#39;`)
    .replace(/"/g, `&quot;`)
    .replace(/>/g, `&gt;`)
    .replace(/</g, `&lt;`);
};

/**
 * Provides support for creating differencing data, as they are typically
 * provided by CoreMedia Studio Server as part of server-side differencing.
 */
export class Differencing {
  /**
   * Simple ID tracking for differences, which just increases with
   * each added difference.
   */
  #currentId = 0;

  #formatId(id: number): string {
    if (id < 0) {
      throw new Error(`Invalid ID number ${id}.`);
    }
    return `diff-${id}`;
  }

  get #id(): string {
    return this.#formatId(this.#currentId);
  }

  get #previousId(): string {
    return this.#formatId(this.#currentId - 1);
  }

  get #nextId(): string {
    return this.#formatId(this.#currentId + 1);
  }

  #incrementId(): void {
    this.#currentId++;
  }

  /**
   * Resets the IDs. Possibly recommended to call in `afterEach` of a test,
   * if differencing instance is shared across tests.
   */
  resetIds(): void {
    this.#currentId = 0;
  }

  static #xdiffAttr(name: XDiffAttribute, value = ""): string {
    return ` xdiff:${name}="${value}"`;
  }

  static #xdiffAttrs(attrs: XDiffAttributes): string[] {
    const xdiffAttr = Differencing.#xdiffAttr;
    return Object.entries(attrs).map(([key, value]) => xdiffAttr(<XDiffAttribute>key, value));
  }

  /**
   * Creates an `xdiff:span` according to the given configuration around
   * the given (HTML) content.
   *
   * **Side Effects:** A call will automatically increase the ID used for
   * next call. If `endOfDifferences` is set to `true`, the IDs will be
   * automatically reset.
   *
   * @param content - content to wrap into `xdiff:span`. Use an empty string
   * to create an empty `<xdiff:span></xdiff:span>`.
   * @param config - configuration for `xdiff:span`.
   */
  span(content: string, config: XDiffSpanConfig): string {
    const xdiffAttr = Differencing.#xdiffAttr;
    const xdiffAttrs = Differencing.#xdiffAttrs;

    const { type: diffType, changes, endOfDifferences } = config;

    const id = this.#id;

    const attributes = xdiffAttrs({ class: `diff-html-${diffType}`, id });

    if (this.#currentId > 0) {
      // Has Previous, so...
      attributes.push(xdiffAttr("previous", this.#previousId));
    }

    if (!endOfDifferences) {
      attributes.push(xdiffAttr("next", this.#nextId));
    }

    if (typeof changes === "string") {
      attributes.push(xdiffAttr("changes", htmlEscape(changes)));
    }

    // ID Tracking Side Effects
    if (endOfDifferences) {
      // Side effect: Reset IDs, assuming, that next span's to generate are
      // independent of current ones.
      this.resetIds();
    } else {
      // Side effect: Prepare ID for next `<xdiff:span>`
      this.#incrementId();
    }

    return [`<xdiff:span`, ...attributes, `>`, content, `</xdiff:span>`].join("");
  }

  /**
   * Creates an `xdiff:span` of type "added" according to the given
   * configuration around the given (HTML) content.
   *
   * **Side Effects:** A call will automatically increase the ID used for
   * next call. If `endOfDifferences` is set to `true`, the IDs will be
   * automatically reset.
   *
   * @param content - content to wrap into `xdiff:span`. Use an empty string
   * to create an empty `<xdiff:span></xdiff:span>`.
   * @param config - configuration for `xdiff:span`.
   */
  add(content: string, config: Omit<XDiffSpanConfig, "type"> = {}): string {
    return this.span(content, { ...config, type: "added" });
  }

  /**
   * Creates an `xdiff:span` of type "removed" according to the given
   * configuration around the given (HTML) content.
   *
   * **Side Effects:** A call will automatically increase the ID used for
   * next call. If `endOfDifferences` is set to `true`, the IDs will be
   * automatically reset.
   *
   * @param content - content to wrap into `xdiff:span`. Use an empty string
   * to create an empty `<xdiff:span></xdiff:span>`.
   * @param config - configuration for `xdiff:span`.
   */
  del(content: string, config: Omit<XDiffSpanConfig, "type"> = {}): string {
    return this.span(content, { ...config, type: "removed" });
  }

  /**
   * Creates an `xdiff:span` of type "changed" according to the given
   * configuration around the given (HTML) content.
   *
   * **Side Effects:** A call will automatically increase the ID used for
   * next call. If `endOfDifferences` is set to `true`, the IDs will be
   * automatically reset.
   *
   * @param content - content to wrap into `xdiff:span`. Use an empty string
   * to create an empty `<xdiff:span></xdiff:span>`.
   * @param config - configuration for `xdiff:span`.
   */
  change(content: string, config: Omit<XDiffSpanConfig, "type"> = {}): string {
    return this.span(content, { ...config, type: "changed" });
  }

  /**
   * Creates an `xdiff:span` of type "conflict" according to the given
   * configuration around the given (HTML) content.
   *
   * **Side Effects:** A call will automatically increase the ID used for
   * next call. If `endOfDifferences` is set to `true`, the IDs will be
   * automatically reset.
   *
   * @param content - content to wrap into `xdiff:span`. Use an empty string
   * to create an empty `<xdiff:span></xdiff:span>`.
   * @param config - configuration for `xdiff:span`.
   */
  conflict(content: string, config: Omit<XDiffSpanConfig, "type"> = {}): string {
    return this.span(content, { ...config, type: "conflict" });
  }

  /**
   * Creates an `xdiff:span` according to the given configuration around
   * an image with the given `href` attribute (will be set as
   * `xlink:href`).
   *
   * **Side-Effects:** A call will automatically increase the ID used for
   * next call. If `endOfDifferences` is set to `true`, the IDs will be
   * automatically reset.
   *
   * @param href - meant to refer to some content's blob property.
   * @param config - configuration for `xdiff:span` along with possible extra
   * class attribute to pass to image.
   */
  img(href: string, config: XDiffSpanConfig & { class?: string }): string {
    const { type: diffType, class: className } = config;
    const classAttr = className ? "" : ` class="${className}"`;
    // noinspection HtmlUnknownAttribute
    const content = `<img${classAttr} alt="Some Image" xlink:actuate="onLoad" xlink:show="embed" xlink:type="simple" xlink:href="${href}" xdiff:changetype="diff-${diffType}-image"/>`;
    return this.span(content, config);
  }
}
