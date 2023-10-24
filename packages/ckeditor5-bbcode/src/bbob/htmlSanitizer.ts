import { CorePlugin, CoreTree } from "@bbob/core/es";
import { escapeHTML, getUniqAttr, isTagNode } from "@bbob/plugin-helper/es";

/**
 * Predicate for filtering attributes. This predicate is not applied to
 * unique attributes.
 *
 * @param attributeName - name of attribute
 * @param tagName - owning tag name
 */
export type AllowedAttributePredicate = (attributeName: string, tagName: string) => boolean;

/**
 * Default attribute filter. Only forbids any `on*` handlers.
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
      item.content = walk(item.content, options);
      // We allow unique attributes by default.
      // Side-Notes:
      //
      // * Unique-Attributes such as `[url=xyz]` are represented in BBob with
      //   key being equal to its value, thus, `xyz=xyz` is the unique attribute
      //   representing the URL.
      // * Escaping of attribute values is done by internal BBob processing
      //   already.
      const uniqAttr = getUniqAttr(item.attrs);
      // Must not use `delete` here, as it may access any properties provided
      // by object.
      item.attrs = Object.fromEntries(
        Object.entries(item.attrs).filter(
          ([attrName]) => uniqAttr === attrName || options.isAllowedAttribute(attrName, item.tag),
        ),
      );
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
