import { CorePlugin, CoreTree } from "@bbob/core/es";
import { getUniqAttr, isTagNode } from "@bbob/plugin-helper/es";

/**
 * Default attribute filter. Only forbids any `on*` handlers.
 *
 * @param tagName - owning tag name
 * @param attributeName - name of attribute
 */
export const defaultIsAllowedAttribute = (tagName: string, attributeName: string): boolean =>
  !attributeName.startsWith("on");

export interface HtmlAttributeSanitizerOptions {
  /**
   * Attribute filter. By default, only forbids any `on*` handlers.
   * Note that unique attributes are not handed over to this predicate.
   *
   * @param tagName - owning tag name
   * @param attributeName - name of attribute
   */
  isAllowedAttribute?: typeof defaultIsAllowedAttribute;
}

const walk = (
  t: CoreTree | CoreTree[number] | CoreTree[number][],
  options: Required<HtmlAttributeSanitizerOptions>,
): undefined => {
  if (Array.isArray(t)) {
    t.forEach((entry) => walk(entry, options));
  } else {
    if (isTagNode(t)) {
      walk(t.content, options);
      // We allow unique attributes by default.
      // Side-Note: Unique-Attributes such as `[url=xyz]` are represented with key being equal to its value,
      // thus, `xyz=xyz` is the unique attribute representing the URL.
      const uniqAttr = getUniqAttr(t.attrs);
      t.attrs = Object.fromEntries(
        Object.entries(t.attrs).filter(
          ([attrName]) => uniqAttr === attrName || options.isAllowedAttribute(t.tag, attrName),
        ),
      );
    }
  }
  return;
};

export const htmlAttributeSanitizer: (options?: HtmlAttributeSanitizerOptions) => CorePlugin = (
  options: HtmlAttributeSanitizerOptions = {},
) => {
  const { isAllowedAttribute = defaultIsAllowedAttribute } = options;
  return (tree) =>
    walk(tree, {
      isAllowedAttribute,
    });
};
