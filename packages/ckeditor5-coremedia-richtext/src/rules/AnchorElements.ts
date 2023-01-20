import {
  extractXLinkAttributes,
  extractXLinkDataSetEntries,
  setXLinkAttributes,
  setXLinkDataSetEntries,
  XLinkAttributes,
} from "./XLink";
import { RuleConfig } from "@coremedia/ckeditor5-dom-converter/Rule";
import { isHTMLAnchorElement } from "@coremedia/ckeditor5-dom-support/HTMLAnchorElements";

export const contentUriPathPrefix = "content" as const;
export const dataContentLinkPattern = /^content\/(?<id>\d+)$/;
export const viewContentLinkPattern = /^content:(?<id>\d+)$/;

export type DataContentLink = `${typeof contentUriPathPrefix}/${number}`;

export type ViewContentLink = `${typeof contentUriPathPrefix}:${number}`;

export const parseDataContentLink = (value: DataContentLink | string): number | undefined => {
  const match = value.match(dataContentLinkPattern);
  if (!match) {
    return;
  }
  // @ts-expect-error: https://github.com/microsoft/TypeScript/issues/32098
  const { id }: { id: string } = match.groups;
  return parseInt(id);
};

export const parseViewContentLink = (value: ViewContentLink | string): number | undefined => {
  const match = value.match(viewContentLinkPattern);
  if (!match) {
    return;
  }
  // @ts-expect-error: https://github.com/microsoft/TypeScript/issues/32098
  const { id }: { id: string } = match.groups;
  return parseInt(id);
};

export const toDataContentLink = (id: number): DataContentLink => `content/${id}`;
export const toViewContentLink = (id: number): ViewContentLink => `content:${id}`;
export const formatHrefForData = (value: ViewContentLink | string): DataContentLink | string => {
  const parsed = parseViewContentLink(value);
  if (parsed !== undefined) {
    return toDataContentLink(parsed);
  }
  // No content link detected. Assume, that it any other link.
  return value;
};

export const formatHrefForView = (value: DataContentLink | string): ViewContentLink | string => {
  const parsed = parseDataContentLink(value);
  if (parsed !== undefined) {
    return toViewContentLink(parsed);
  }
  // No content link detected. Assume, that it any other link.
  return value;
};

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

export const anchorElements: RuleConfig = {
  id: `transform-anchor-element-attributes-bijective`,
  toData: {
    id: `toData-transform-xlink-attributes`,
    // Do early, to benefit from richer HTML API.
    prepare: (node): void => {
      if (isHTMLAnchorElement(node)) {
        const xlinkAttrs = {
          ...extractXLinkDataSetEntries(node),
          // Provides xlink:role and xlink:show.
          ...parseTarget(node.target),
          href: formatHrefForData(node.href),
        };
        setXLinkAttributes(node, xlinkAttrs);
        // Clear used data:
        node.removeAttribute("target");
        node.removeAttribute("href");
      }
    },
  },
  toView: {
    id: `toView-transform-xlink-attributes`,
    imported: (node, { api }): Node => {
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
    },
  },
};
