import { CorePlugin, CoreTree } from "@bbob/core/es";
import { escapeHTML, getUniqAttr, isTagNode } from "@bbob/plugin-helper/es";

/**
 * Context information for evaluating allowed attributes.
 */
export interface AllowedAttributePredicateContext {
  /**
   * `true`, if this denotes the unique attribute for the current tag.
   */
  unique: boolean;
  /**
   * Tag this attribute belongs to.
   */
  tag: string;
}

/**
 * Predicate for filtering attributes.
 *
 * @param attributeName - name of attribute
 * @param context - attribute context information
 */
export type AllowedAttributePredicate = (attributeName: string, context: AllowedAttributePredicateContext) => boolean;

/**
 * Default attribute filter. Only forbids any `on*` handlers.
 *
 * This filter ignores possible effects of
 * https://github.com/JiLiZART/BBob/issues/202: If a unique attribute (like the
 * URL in `[url=disallowedAttributeName]`) occurs, this unique attribute will
 * be removed, too. An alternative solution may have been (thus, design scope)
 * to never filter attributes marked as `unique`, which may be a security issue,
 * though.
 */
export const defaultIsAllowedAttribute: AllowedAttributePredicate = (attributeName: string): boolean =>
  !attributeName.toLowerCase().startsWith("on");

export interface HtmlSanitizerOptions {
  /**
   * If to allow HTML tags within BBCode (text contents). Defaults to `false`.
   *
   * Note possible security implications when you enable plain HTML.
   */
  allowHtml?: boolean;
  /**
   * Attribute filter. By default, only forbids any `on*` handlers.
   * Note that unique attributes are not handed over to this predicate.
   *
   * @param tagName - owning tag name
   * @param attributeName - name of attribute
   */
  isAllowedAttribute?: AllowedAttributePredicate;
}

/**
 * Walks the complete tree or item.
 *
 * Note that typing is flawed regarding more narrow string types. You cannot
 * expect a string (representing a string content) to be returned unmodified.
 *
 * @param item - the single item or complete tree to walk
 * @param options - options to respect during processing
 * @returns the possibly modified instance of the input argument
 */
const walk = <T extends CoreTree | CoreTree[number] | CoreTree[number][]>(
  item: T,
  options: Required<HtmlSanitizerOptions>,
): T => {
  if (Array.isArray(item)) {
    for (let i = 0; i < item.length; i++) {
      item[i] = walk(item[i], options);
    }
  } else {
    if (isTagNode(item)) {
      item.content = walk(item.content ?? [], options);
      // Notes:
      //
      // * Unique-Attributes such as `[url=xyz]` are represented in BBob with
      //   key being equal to its value, thus, `xyz=xyz` is the unique attribute
      //   representing the URL.
      //
      // * Also, unique attributes always have to be the last entry within
      //   the record, according to the BBob implementation.
      //
      // * Escaping of attribute values is done by internal BBob processing
      //   already.
      //
      // We accept and thus ignore a possible flaw here reported as:
      // https://github.com/JiLiZART/BBob/issues/202.
      //
      // A possible affect may be, that given a URL tag like:
      //
      // ```bbcode
      // [url=forbiddenAttribute]
      // ```
      //
      // Will be filtered, although it should not. We consider this scenario
      // unlikely and accept possible false-positive filters applied.
      const uniqAttr = getUniqAttr(item.attrs);
      // Must not use `delete` here, as it may access any properties provided
      // by object.
      item.attrs = Object.fromEntries(
        Object.entries(item.attrs).filter(([attrName]) =>
          options.isAllowedAttribute(attrName, {
            unique: uniqAttr === attrName,
            tag: item.tag,
          }),
        ),
      );
      // Design-Scope: Another option would be to use TagNode.create to create
      // a new node, instead of modifying the existing one. This would be the
      // better option, if we think a `TagNode` to represent some immutable
      // state.
    } else {
      // TS-2322: This is not perfect (and should not become public API):
      // We may invoke `walk` with some subtype of string such as `myConst`.
      // In this case, we cannot guarantee, that the constant is returned
      // unchanged. If it is, for example, `<` it is even expected, that it is
      // returned as escaped HTML.
      return options.allowHtml ? item : (escapeHTML(item) as T);
    }
  }
  return item;
};

/**
 * Sanitizes BBCode tree suitable for HTML generation.
 *
 * This sanitizer expects some yet unprocessed tree, thus, it must be first in
 * the list of applied plugins. Otherwise, it may cause wrong escaping for
 * already intermediate render results (like some preset, that already adds
 * raw HTML tags by intention to the contents; we do so currently for
 * code blocks, for example, within the CKEditor 5 preset).
 *
 * @param options sanitizer options
 */
export const htmlSanitizer: (options?: HtmlSanitizerOptions) => CorePlugin = (options: HtmlSanitizerOptions = {}) => {
  const { isAllowedAttribute = defaultIsAllowedAttribute, allowHtml = false } = options;
  return (tree) =>
    walk(tree, {
      allowHtml,
      isAllowedAttribute,
    });
};
