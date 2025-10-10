import { EditorConfig, Config } from "ckeditor5";
import { InheritingMatcherPattern } from "./ReducedMatcherPattern";

const COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY = "coremedia:richtextSupport";

/**
 * Configuration for CoreMedia General RichText Support.
 */
interface CoreMediaRichTextSupportConfig {
  /**
   * Aliases for elements known by CoreMedia RichText 1.0 DTD.
   * Registering aliases is strongly recommended, if you add a data-processing
   * step to represent a given RichText element as a different HTML element,
   * e.g., based on assigned classes.
   *
   * For example, if you added data-processing to map
   * `<span class="mark">` from data to `<mark>` in data view, you will want to
   * register `mark` as being an alias for `span`, so that it shares the same
   * attributes it may get.
   *
   * If your data-processing also includes extracting extra attributes, you may
   * declare them in addition to the alias. For example, if you want to provide
   * an attribute `data-priority` derived from an additional class at the
   * `<span>` element, you may register it as follows:
   *
   * ```
   * {
   *   name: "mark",
   *   inherit: "span",
   *   attributes: {
   *     "data-priority": /^(high|medium|low)$/,
   *   },
   * }
   * ```
   *
   * Having this, data-view will be able to hold elements such as
   * `<mark data-priority="high">`.
   */
  aliases?: InheritingMatcherPattern[];
}
const getConfig = (config: Config<EditorConfig>): CoreMediaRichTextSupportConfig =>
  config.get(COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY) ?? {};
export default CoreMediaRichTextSupportConfig;
export { COREMEDIA_RICHTEXT_SUPPORT_CONFIG_KEY, getConfig };
