import {
  extractXLinkAttributes,
  extractXLinkDataSetEntries,
  setXLinkAttributes,
  setXLinkDataSetEntries,
  XLinkAttributes,
} from "./XLink";
import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/Rule";
import { isHTMLAnchorElement } from "@coremedia/ckeditor5-dom-support/HTMLAnchorElements";
import { ConversionApi } from "@coremedia/ckeditor5-dom-converter/ConversionApi";

const contentUriPathPrefix = "content" as const;

/**
 * Pattern for extracting ID (group: `id`) from link as represented in data.
 * Support URI Paths from CoreMedia Studio as well as UAPI Links.
 */
const dataContentLinkPattern = /^(?:coremedia:\/{3}cap\/)?content\/(?<id>\d+)$/;

/**
 * Pattern for extracting ID (group: `id`) from link as represented in data
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
 * general `content/<id>` is expected in context of CoreMedia Studio.
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
    return;
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
    return;
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
 * Transforms the given ID to a content link is represented in data layer, thus,
 * `content/${number}`.
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
  // No content link detected. Assume, that it any other link.
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
  // No content link detected. Assume, that it any other link.
  return value;
};

/**
 * Formats value for `target` attribute of an anchor element, so that it can
 * be edited as part of the CKEditor 5 Link feature (with additional
 * CoreMedia Plugin).
 *
 * As CoreMedia Rich Text 1.0 does not support the `target` attribute, it was
 * best practice ever since CoreMedia Rich Text 1.0, to encode the `target` into
 * two attributes `xlink:show` and `xlink:role`.
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

  if (!show) {
    if (role) {
      // artificial state, which should not happen (but may happen due to UAPI calls).
      target = `_role_${role}`;
    }
  } else {
    // Signals, if to (still) handle the role. May be reset, once the role
    // has been handled. Signals an artificial state, if role is unexpected
    // for a given show attribute (like "replace").
    let handleRole = !!role;
    switch (show.toLowerCase()) {
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
          handleRole = false;
        }
        break;
      default:
        if (handleRole) {
          target = `_role_${role}`;
          console.warn(`Invalid value for xlink:show="${show}". Only xlink:role respected in target attribute.`);
        } else {
          console.warn(`Invalid value for xlink:show="${show}". Empty target provided.`);
        }
        handleRole = false;
    }
    if (handleRole) {
      target = `${target}_${role}`;
      console.info(
        `Unexpected xlink:role="${role}" for xlink:show="${show}". Providing artificial target="${target}".`
      );
    }
  }
  return target;
};

/**
 * Parses targets as, for example, generated by `formatTarget` back to a
 * representation in attributes `xlink:show` and `xlink:role`.
 *
 * @param target - target to parse
 * @returns parsed result; possibly empty object
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
    // has been handled. Signals an artificial state, if role is unexpected
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
          // artificial state: someone added this target, while an expected
          // role is missing. Assuming, that this should be handled as normal
          // target.
          newAttrs.show = "other";
          newAttrs.role = target;
        } else {
          newAttrs.role = suggestedRole;
        }
        break;
      default:
        // We have a target with an underscore, but it does not seem to
        // be a "reserved" word. Take the complete target as role instead.
        handleRole = false;
        newAttrs.show = "other";
        newAttrs.role = target;
    }
    if (handleRole) {
      // Artificial state where a show attribute comes with an unexpected
      // role attribute. As this is still valid from DTD perspective, let's
      // keep the role.
      newAttrs.role = suggestedRole;
    }
  }
  return newAttrs;
};

/**
 * Transforms attributes of anchor element (if identified as anchor element)
 * to suitable attributes in data representation.
 *
 * Note, that this should be called early in data-processing when still
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
      href: formatHrefForData(node.getAttribute("href") ?? ""),
    };
    setXLinkAttributes(node, xlinkAttrs);
    // Clear used data:
    node.removeAttribute("target");
    node.removeAttribute("href");
  }
};

/**
 * Transforms attributes of anchor element (if identified as anchor element)
 * to suitable attributes in data view representation.
 *
 * Note, that this should be called later in data-processing when
 * operating on HTML DOM representation to benefit from richer API.
 *
 * @param node - node to possibly adapt
 * @param api - conversion API
 * @param api.api - conversion API
 */
export const transformLinkAttributesToView = (node: Node, { api }: { api: ConversionApi }): Node => {
  if (isHTMLAnchorElement(node)) {
    const xlinkAttrs = extractXLinkAttributes(node);
    const { href, show, role } = xlinkAttrs;

    // Clear respected data.
    delete xlinkAttrs.href;
    delete xlinkAttrs.show;
    delete xlinkAttrs.role;

    if (href === undefined) {
      // Invalid state, that should not happen for valid CoreMedia Rich Text 1.0
      console.warn("Invalid anchor node in data without required `xlink:href` attribute set. Ignoring node.");
      // The empty document fragment ensures, that we keep the children.
      return api.createDocumentFragment();
    }
    node.href = formatHrefForView(href);

    const target = formatTarget({ show, role });
    if (target) {
      node.target = target;
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
