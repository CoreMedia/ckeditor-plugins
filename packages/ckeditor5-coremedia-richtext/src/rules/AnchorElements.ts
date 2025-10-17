import type { ConversionApi, RuleConfig, RuleSectionConfig } from "@coremedia/ckeditor5-dom-converter";
import { isHTMLAnchorElement } from "@coremedia/ckeditor5-dom-support";
import type { RequireSelected } from "@coremedia/ckeditor5-common";
import type { XLinkAttributes } from "./XLink";
import {
  extractXLinkAttributes,
  extractXLinkDataSetEntries,
  setXLinkAttributes,
  setXLinkDataSetEntries,
  xLinkNamespaceUri,
} from "./XLink";

export const contentUriPathPrefix = "content";

/**
 * Pattern for extracting ID (group: `id`) from the link as represented in data.
 * Support URI Paths from CoreMedia Studio as well as UAPI Links.
 */
const dataContentLinkPattern = /^(?:coremedia:\/{3}cap\/)?content\/(?<id>\d+)$/;

/**
 * Pattern for extracting ID (group: `id`) from the link as represented in data
 * view.
 */
const viewContentLinkPattern = /^content:(?<id>\d+)$/;

/**
 * Template literal string for UAPI Content Links.
 */
export type UapiContentLink = `coremedia:///cap/content/${number}`;

/**
 * Template literal string for Content Links as represented in general in data.
 */
export type DataContentLink = `${typeof contentUriPathPrefix}/${number}`;

/**
 * Template literal string for Content Links as represented in data view.
 */
export type ViewContentLink = `${typeof contentUriPathPrefix}:${number}`;

/**
 * Parses ID of content links as they are represented in data. For convenience,
 * especially in source editing, also UAPI links are supported, while in
 * general `content/<id>` is expected in the context of CoreMedia Studio.
 *
 * Thus, you may expect results as follows, for example:
 *
 * * `content/42` evaluates to number 42
 * * `coremedia:///cap/content/42` evaluates to number 42
 * * `https://example.org/` evaluates to `undefined`
 *
 * @param value - value to parse
 */
export const parseDataContentLink = (value: DataContentLink | UapiContentLink | string): number | undefined => {
  const match = value.match(dataContentLinkPattern);
  if (!match) {
    return undefined;
  }
  // @ts-expect-error: https://github.com/microsoft/TypeScript/issues/32098
  const { id }: { id: string } = match.groups;
  const parsed = parseInt(id);
  if (isNaN(parsed)) {
    // Should not happen for valid RegExp, but provides an additional safety net.
    return undefined;
  }
  return parsed;
};

/**
 * Parses ID of content links as they are represented in data view.
 *
 * Thus, you may expect results as follows, for example:
 *
 * * `content:42` evaluates to number 42
 * * `https://example.org/` evaluates to `undefined`
 *
 * @param value - value to parse
 */
export const parseViewContentLink = (value: ViewContentLink | string): number | undefined => {
  const match = value.match(viewContentLinkPattern);
  if (!match) {
    return undefined;
  }
  // @ts-expect-error: https://github.com/microsoft/TypeScript/issues/32098
  const { id }: { id: string } = match.groups;
  const parsed = parseInt(id);
  if (isNaN(parsed)) {
    // Should not happen for valid RegExp, but provides an additional safety net.
    return undefined;
  }
  return parsed;
};

/**
 * Transforms the given ID to a content link is represented in the data layer,
 * thus, `content/${number}`.
 *
 * @param id - id to format
 */
export const toDataContentLink = (id: number): DataContentLink => `content/${id}`;
/**
 * Transforms the given ID to a content link is represented in view layer, thus,
 * `content:${number}`.
 *
 * @param id - id to format
 */
export const toViewContentLink = (id: number): ViewContentLink => `content:${id}`;

/**
 * Formats a link suitable for representation in data send to CoreMedia Studio
 * server.
 *
 * @param value - value from data view to transform
 */
export const formatHrefForData = (value: ViewContentLink | string): DataContentLink | string => {
  const parsed = parseViewContentLink(value);
  if (parsed !== undefined) {
    return toDataContentLink(parsed);
  }
  // No content link detected. Assume that it is any other link.
  return value;
};

/**
 * Formats a link suitable for representation in data view. This format provides
 * good integration into CKEditor 5 Link Feature.
 *
 * @param value - value from data to transform
 */
export const formatHrefForView = (value: DataContentLink | string): ViewContentLink | string => {
  const parsed = parseDataContentLink(value);
  if (parsed !== undefined) {
    return toViewContentLink(parsed);
  }
  // No content link detected. Assume that it is any other link.
  return value;
};

/**
 * Invoked by default if the given value of `xlink:role` has not been processed
 * yet during the transformation to data-view.
 *
 * @param target - already processed target information; possibly empty
 * @param artificialRole - artificial, thus, yet unhandled role attribute value
 * @returns new target, including the representation of the artificial role
 */
export const defaultArtificialRoleToTarget = (target: string, artificialRole: string): string => {
  let result: string;

  if (!target) {
    result = `_role_${artificialRole}`;
    console.warn(`Unexpected xlink:role="${artificialRole}". Providing artificial target="${result}".`);
  } else {
    result = `${target}_${artificialRole}`;
    console.info(`Unexpected xlink:role="${artificialRole}". Providing artificial target="${result}".`);
  }

  return result;
};

/**
 * Formats value for `target` attribute of an anchor element, so that it can
 * be edited as part of the CKEditor 5 Link feature (with additional
 * CoreMedia Plugin).
 *
 * As CoreMedia Rich Text 1.0 does not support the `target` attribute, it was
 * the best practice ever since CoreMedia Rich Text 1.0, to encode the `target`
 * into two attributes `xlink:show` and `xlink:role`.
 *
 * For transformation, some artificial states provide a consistent format, so
 * that it is suitable to restore the original state later on, when transforming
 * `target` back to `xlink:role`/`xlink:show` again.
 *
 * @param attributes - relevant XLink attributes `role` and `show` to format target.
 */
export const formatTarget = (attributes: Pick<XLinkAttributes, "role" | "show">): string => {
  const { show, role } = attributes;
  let target = "";

  const normalizedShow = show?.toLowerCase().trim() ?? "";
  const hasRole = !!role;
  const hasShow = !!normalizedShow;

  // Signals, if to (still) handle the role. May be reset, once the role
  // has been handled. Signals an artificial state if the role is unexpected
  // for a given show attribute (like "replace").
  let hasUnhandledRole = hasRole;
  switch (normalizedShow) {
    case "replace":
      target = "_self";
      break;
    case "new":
      target = "_blank";
      break;
    case "embed":
      target = "_embed";
      break;
    case "none":
      target = "_none";
      break;
    case "other":
      if (!role) {
        target = "_other";
      } else {
        target = role;
        hasUnhandledRole = false;
      }
      break;
    default:
      hasShow && console.warn(`Ignoring unsupported value for xlink:show="${show}".`);
  }

  if (hasRole && hasUnhandledRole) {
    target = defaultArtificialRoleToTarget(target, role);
  }

  return target;
};

/**
 * Parses the given title and if non-empty provides the corresponding snippet
 * for XLink attributes.
 *
 * @param title - title to possibly add to attributes, if non-empty
 */
export const parseTitle = (title: string): Partial<Pick<XLinkAttributes, "title">> => {
  const result: Partial<Pick<XLinkAttributes, "title">> = {};
  if (title) {
    result.title = title;
  }
  return result;
};

/**
 * Parses targets as, for example, generated by `formatTarget` back to a
 * representation in attributes `xlink:show` and `xlink:role`.
 *
 * @param target - target to parse
 * @returns parsed result; possibly an empty object
 */
export const parseTarget = (target: string): Partial<Pick<XLinkAttributes, "show" | "role">> => {
  const newAttrs: Partial<Pick<XLinkAttributes, "show" | "role">> = {};
  const showRoleExpression = /^(_[^_]+)(?:|_(.+))$/;
  const showRoleMatchResult = target.match(showRoleExpression);
  if (!showRoleMatchResult) {
    // Triggers: ignore empty target
    if (target) {
      // We don't need to check for any target with special meaning,
      // just take it as "normal" named target attribute.
      newAttrs.show = "other";
      newAttrs.role = target;
    }
  } else {
    // We have a target, which may express a special show-state as
    // well possibly a role.
    const suggestedShow: string = showRoleMatchResult[1];
    const suggestedRole: string | undefined = showRoleMatchResult[2];
    // Signals, if to (still) handle the role. May be reset, once the role
    // has been handled. Signals an artificial state if the role is unexpected
    // for a given show attribute (like "replace").
    let handleRole = !!suggestedRole;
    switch (suggestedShow.toLowerCase()) {
      case "_self":
        newAttrs.show = "replace";
        break;
      case "_blank":
        newAttrs.show = "new";
        break;
      case "_embed":
        newAttrs.show = "embed";
        break;
      case "_none":
        newAttrs.show = "none";
        break;
      case "_other":
        // artificial state, which should not happen (but may happen due to UAPI calls).
        newAttrs.show = "other";
        break;
      case "_role":
        handleRole = false;
        if (!suggestedRole) {
          // Artificial state: someone added this target, while an expected
          // role is missing. Assuming that this should be handled as a normal
          // target.
          newAttrs.show = "other";
          newAttrs.role = target;
        } else {
          newAttrs.role = suggestedRole;
        }
        break;
      default:
        // We have a target with an underscore, but it does not seem to
        // be a "reserved" word. Take the complete target as the role instead.
        handleRole = false;
        newAttrs.show = "other";
        newAttrs.role = target;
    }
    if (handleRole) {
      // Artificial state where a show attribute comes with an unexpected
      // role attribute. As this is still valid from the DTD perspective, let's
      // keep the role.
      newAttrs.role = suggestedRole;
    }
  }
  return newAttrs;
};

/**
 * Transforms attributes of an anchor element (if identified as an anchor element)
 * to suitable attributes in data representation.
 *
 * Note that this should be called early in data-processing when still
 * operating on HTML DOM representation to benefit from richer API.
 *
 * @param node - node to possibly adapt
 */
export const transformLinkAttributesToData = (node: Node): void => {
  if (isHTMLAnchorElement(node)) {
    const xlinkAttrs = {
      ...extractXLinkDataSetEntries(node),
      // Provides xlink:role and xlink:show.
      ...parseTarget(node.target),
      ...parseTitle(node.title),
      href: formatHrefForData(node.getAttribute("href") ?? ""),
    };
    setXLinkAttributes(node, xlinkAttrs);
    // Clear used data:
    node.removeAttribute("target");
    node.removeAttribute("title");
    node.removeAttribute("href");
  }
};

/**
 * Transforms attributes of an anchor element (if identified as an anchor element)
 * to suitable attributes in data view representation.
 *
 * Note that this should be called later in data-processing when
 * operating on HTML DOM representation to benefit from richer API.
 *
 * @param node - node to possibly adapt
 * @param api - conversion API
 * @param api.api - conversion API
 */
export const transformLinkAttributesToView = (node: Node, { api }: { api: ConversionApi }): Node => {
  if (isHTMLAnchorElement(node)) {
    const xlinkAttrs = extractXLinkAttributes(node);
    const { href, show, role, title } = xlinkAttrs;

    // Clear respected data.
    delete xlinkAttrs.href;
    delete xlinkAttrs.role;
    delete xlinkAttrs.show;
    delete xlinkAttrs.title;

    if (href === undefined) {
      // Invalid state, that should not happen for valid CoreMedia Rich Text 1.0
      console.warn("Invalid anchor node in data without required `xlink:href` attribute set. Ignoring node.");
      // The empty document fragment ensures that we keep the children.
      return api.createDocumentFragment();
    }
    node.href = formatHrefForView(href);

    const target = formatTarget({ show, role });
    if (target) {
      node.target = target;
    }

    if (title) {
      node.title = title;
    }

    setXLinkDataSetEntries(node, xlinkAttrs);
  }
  return node;
};

export const anchorElements: RuleConfig = {
  id: `transform-anchor-element-attributes-bijective`,
  toData: {
    id: `toData-transform-xlink-attributes`,
    // Do early, to benefit from richer HTML API.
    prepare: transformLinkAttributesToData,
  },
  toView: {
    id: `toView-transform-xlink-attributes`,
    imported: transformLinkAttributesToView,
  },
};

/**
 * Pre-processors to run prior to transforming anchor elements.
 */
export interface HTMLAnchorElementPreprocessor {
  /**
   * Rule to possibly pre-process the `HTMLAnchorElement` prior to default
   * `toData` processing.
   *
   * @param element - the element to transform
   */
  toData?: (element: HTMLAnchorElement) => void;
  /**
   * Rule to possibly pre-process the `HTMLAnchorElement` prior to default
   * `toView` processing.
   *
   * @param element - the element to transform
   */
  toView?: (element: HTMLAnchorElement) => void;
}

/**
 * Get a rule configuration suitable to intercept the processing of an anchor
 * element, prior to the default handlers apply.
 *
 * The pre-processor must not modify the node's identity. It is meant to deal
 * with the corresponding attributes.
 *
 * @param preProcessor - pre-processor to run
 * @param ruleId - ID to use for the provided rule configuration
 */
export const preProcessAnchorElement = (
  preProcessor:
    | RequireSelected<HTMLAnchorElementPreprocessor, "toData">
    | RequireSelected<HTMLAnchorElementPreprocessor, "toView">,
  ruleId = "pre-process-anchor-element",
): RuleConfig => {
  const { toData: toDataMapper, toView: toViewMapper } = preProcessor;

  const toData: RuleSectionConfig = {
    id: `toData-${ruleId}`,
    prepare: (node: Node): void => {
      if (isHTMLAnchorElement(node)) {
        toDataMapper?.(node);
      }
    },
  };

  const toView: RuleSectionConfig = {
    id: `toView-${ruleId}`,
    imported: (node: Node): Node => {
      if (isHTMLAnchorElement(node)) {
        toViewMapper?.(node);
      }
      return node;
    },
  };

  return {
    id: ruleId,
    // Need to run before default processing.
    priority: "high",
    toData,
    toView,
  };
};

/**
 * Maps artificial `xlink:role` according to given pre-processors.
 *
 * **What are artificial `xlink:role` attributes?**
 *
 * Despite for `xlink:show="other"` the attribute `xlink:role` is expected
 * to be unset, when it comes to representing the attributes as `target`
 * attribute in view layers of CKEditor 5.
 *
 * Thus, if `xlink:show` is different to `"other"`, but `xlink:role` is set,
 * this attribute is denoted as being _artificial_.
 *
 * **What happens to an artificial `xlink:role` attribute by default?**
 *
 * By default, such an attribute is encoded into the `target` attribute
 * in a bijective manner, which is, that from the given `target` attribute
 * value in view layers, the corresponding `xlink:show` and `xlink:role` values
 * can still be determined.
 *
 * **When to use `mapArtificialXLinkRole`?**
 *
 * As the CoreMedia Rich Text 1.0 DTD does not define an artificial
 * `xlink:role` as invalid, it is perfectly fine, if `xlink:role` is used
 * to hold data unrelated to the `target` behavior.
 *
 * Creating a rule configuration by this factory method and applying it to
 * your custom rules configuration provides the opportunity to store such
 * `xlink:role` in a different attribute.
 *
 * **How to deal with `toData` processing?**
 *
 * If you stored the role in a different attribute, you should restore its
 * value here and return it.
 *
 * **Caveat:**
 *
 * Editors may trigger the default mapping to handle `xlink:role` even for
 * `xlink:show` states different to `other`, for example, if setting `target`
 * in view layers to `_embed_someRole`. In these cases, the default processing
 * will override any `xlink:role` created by the mapping generated here.
 *
 * This is assumed to be a very rare corner-case, though.
 *
 * **The _all defaults_ scenario:**
 *
 * If you just invoke `mapArtificialXLinkRole()` it will, by default, create
 * a rule configuration that strips any artificial roles in `toView` mapping
 * and of course does not apply any `xlink:role` in its `toData` mapping.
 *
 * **Example: Store in `class` attribute:**
 *
 * The following example demonstrates how to possibly store an artificial
 * role within the class attribute of the anchor element:
 *
 * ```typescript
 * mapArtificialXLinkRole({
 *   toView: (element, role) => {
 *     // Class token must not contain spaces.
 *     const sanitizedRole = role.replaceAll(/\s/g, "_");
 *     element.classList.add(`role_${sanitizedRole}`);
 *   },
 *   toData: (element) => {
 *     const matcher = /^role_(\S*)$/;
 *     const matchedClasses: string[] = [];
 *     let role: string | undefined;
 *     for (const cls of element.classList) {
 *       const match = cls.match(matcher);
 *       if (match) {
 *         const [matchedCls, matchedRole] = match;
 *         // The last matched role will win.
 *         role = matchedRole;
 *         // Used to clean any class, that represents a role.
 *         matchedClasses.push(matchedCls);
 *       }
 *     }
 *     // Clean-up any matched classes and possibly left-over `class=""`.
 *     element.classList.remove(...matchedClasses);
 *     if (element.classList.length === 0) {
 *       element.removeAttribute("class");
 *     }
 *     // If falsy, `xlink:role` will not be added.
 *     return role;
 *   },
 * })
 * ```
 *
 * **Note for Custom Attributes:**
 *
 * For any other attribute you have chosen to store the role in, ensure, to
 * register it as belonging to a link, so that, for example, removing the link
 * will also clean up the role-representing attribute.
 *
 * @param rolePreProcessor - pre-processors for artificial role mapping
 * @param rolePreProcessor.toData - strategy to extract the role attribute value
 * from the element; any truthy value returned will be applied as `xlink:role` attribute.
 * @param rolePreProcessor.toView - the `toView` mapping, which may store the
 * given value of `xlink:role` in some other attribute
 * @param excludeShow - excluded values of `show` when not to apply the
 * artificial role mapping; defaults to the recommended default `["other"]`
 */
export const mapArtificialXLinkRole = (
  rolePreProcessor: {
    toData?: (element: HTMLAnchorElement) => string | undefined;
    toView?: (element: HTMLAnchorElement, role: string) => void;
  } = {},
  excludeShow: ("replace" | "new" | "embed" | "none" | "other" | string | undefined)[] = ["other"],
): RuleConfig =>
  preProcessAnchorElement(
    {
      toData: (element: HTMLAnchorElement): void => {
        const role = rolePreProcessor.toData?.(element);
        if (role) {
          setXLinkAttributes(element, { role });
        }
      },
      toView: (element: HTMLAnchorElement): void => {
        const showAttribute = element.getAttributeNodeNS(xLinkNamespaceUri, "show");
        const roleAttribute = element.getAttributeNodeNS(xLinkNamespaceUri, "role");
        const show = showAttribute?.value;
        const role = roleAttribute?.value;
        if (role && !excludeShow.includes(show)) {
          element.removeAttributeNode(roleAttribute);
          rolePreProcessor.toView?.(element, role);
        }
      },
    },
    "map-artificial-xlink-role",
  );
