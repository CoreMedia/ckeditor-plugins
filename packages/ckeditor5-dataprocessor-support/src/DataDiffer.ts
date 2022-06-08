/**
 * Provides a way to get a difference of given data values. Typical usage is,
 * when two given data values are considered equivalent and a difference
 * when passing processing:
 *
 * ```text
 * data →
 *   data view →
 *   model →
 *   editing view →
 *   model →
 *   data view →
 *   data
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
export interface DataDiffer<O = unknown> {
  /**
   * Signals if the given values are not equivalent.
   *
   * @param value1 - first value to compare
   * @param value2 - second value to compare
   * @param options - options for comparison
   * @returns if the given values are considered equivalent respecting the given options.
   */
  areDifferent(value1: string, value2: string, options?: O): boolean;
}

/**
 * Simple differ just comparing by strict equals.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SimpleDataDiffer<O = never> extends DataDiffer<O> {}

/**
 * Simple differ just comparing by strict equals.
 */
export class SimpleDataDifferMixin<O = never> implements SimpleDataDiffer<O> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  areDifferent(value1: string, value2: string, options?: O): boolean {
    return value1 !== value2;
  }
}

/**
 * Options for XML Data Differ.
 */
export interface XmlDataDifferOptions {
  /**
   * Ignores the XML declaration header in comparison.
   */
  ignoreDeclaration?: boolean;
  /**
   * Ignores any namespaces declarations within the document.
   */
  ignoreNamespaceDeclarations?: boolean;
}

/**
 * By default, ignores XML declaration as well as namespace declarations.
 */
export const defaultXmlDataDifferOptions: Required<XmlDataDifferOptions> = {
  ignoreDeclaration: true,
  ignoreNamespaceDeclarations: true,
};

const xmlDeclarationRegExp = /^\s*<\?.*?\?>\s*/s;
const namespaceDeclarationRegExp = /(?<=<[^>]*)xmlns(?::\w+)?=['"][^'"]+['"]\s*(?=[^>]*>)/gs;
const elementRegExp = /(?<=<)[^>]+(?=>)/gs;
/**
 * XML Aware difference validator.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface XmlDataDiffer<O extends XmlDataDifferOptions = XmlDataDifferOptions> extends DataDiffer<O> {}

/**
 * XML Aware difference validator.
 */
export class XmlDataDifferMixin<O extends XmlDataDifferOptions = XmlDataDifferOptions>
  extends SimpleDataDifferMixin<O>
  implements XmlDataDiffer<O>
{
  /**
   * Remove XML declaration, if considered irrelevant for comparison.
   *
   * @param value - value to normalize
   * @param options - normalization options
   */
  protected normalizeDeclaration(value: string, options: Required<Pick<O, "ignoreDeclaration">>): string {
    if (!options.ignoreDeclaration) {
      // Only strip irrelevant spaces.
      return value.replace(xmlDeclarationRegExp, (s) => s.trim());
    }
    return value.replace(xmlDeclarationRegExp, "");
  }

  /**
   * Remove XML namespace declarations, if considered irrelevant for comparison.
   *
   * @param value - value to normalize
   * @param options - normalization options
   */
  protected normalizeNamespaceDeclarations(
    value: string,
    options: Required<Pick<O, "ignoreNamespaceDeclarations">>
  ): string {
    if (!options.ignoreNamespaceDeclarations) {
      return value;
    }
    return (
      value
        // First remove namespace declarations.
        .replaceAll(namespaceDeclarationRegExp, "")
        // Then we may have redundant spaces left: Remove.
        .replace(elementRegExp, (s) => s.trim())
    );
  }

  /**
   * Normalize the given value according to the given options.
   *
   * @param value - value to normalize
   * @param options - normalization options
   */
  protected normalize(value: string, options: Required<Pick<O, keyof XmlDataDifferOptions>>): string {
    const normalizers = [this.normalizeDeclaration, this.normalizeNamespaceDeclarations];
    let result = value;
    normalizers.forEach((n) => (result = n(result, options)));
    return result;
  }

  areDifferent(value1: string, value2: string, options?: O): boolean {
    if (!super.areDifferent(value1, value2)) {
      return false;
    }
    const withDefaultOptions = {
      ...defaultXmlDataDifferOptions,
      ...options,
    };
    const normalized1 = this.normalize(value1, withDefaultOptions);
    const normalized2 = this.normalize(value2, withDefaultOptions);
    return normalized1 !== normalized2;
  }
}
