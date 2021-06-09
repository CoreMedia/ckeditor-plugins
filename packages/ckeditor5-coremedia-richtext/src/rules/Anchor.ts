import { ToDataAndViewElementConfiguration } from "@coremedia/ckeditor5-dataprocessor-support/Rules";
import ElementProxy from "@coremedia/ckeditor5-dataprocessor-support/ElementProxy";

function hasHref({ attributes }: ElementProxy): boolean {
  const href = attributes["href"];
  return href === "" || !!href;
}

function hrefToXLinkHref({ attributes }: ElementProxy): void {
  // It should have been checked before, that we have a href attribute set.
  const href: string = <string>attributes["href"];
  delete attributes["href"];
  attributes["xlink:href"] = href;
}

function targetToXLinkAttributes({ attributes }: ElementProxy): void {
  const target = attributes["target"] || "";
  // Just ensure, that even no empty target is written.
  delete attributes["target"];

  const newAttrs: {
    show?: string;
    role?: string;
  } = {};
  const showRoleExpression = /^(_[^_]+)(?:|_(.+))$/;
  const showRoleMatchResult = target.match(showRoleExpression);
  if (!showRoleMatchResult) {
    // Triggers: ignore empty target
    if (!!target) {
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
  if (!!newAttrs.show) {
    attributes["xlink:show"] = newAttrs.show;
  }
  if (!!newAttrs.role) {
    attributes["xlink:role"] = newAttrs.role;
  }
}

function xLinkHrefToHref({ attributes }: ElementProxy): void {
  const href = attributes["xlink:href"];
  delete attributes["xlink:href"];
  attributes["href"] = href;
}

function xLinkShowAndRoleToTarget(node: ElementProxy): void {
  const show = node.attributes["xlink:show"];
  const role = node.attributes["xlink:role"];

  delete node.attributes["xlink:show"];
  delete node.attributes["xlink:role"];

  let target = "";

  if (!show) {
    if (!role) {
      // No attribute to add. We just don't have any link behavior set.
      return;
    }
    // artificial state, which should not happen (but may happen due to UAPI calls).
    target = `_role_${role}`;
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
          console.warn(
            `Invalid value for xlink:show="${show}". Only xlink:role respected in target attribute. Node:`,
            node
          );
        } else {
          console.warn(
            `Invalid value for xlink:show="${show}". No target attribute will be generated. Node:`,
            node
          );
        }
    }
    if (handleRole) {
      target = `${target}_${role}`;
      console.info(
        `Unexpected xlink:role="${role}" for xlink:show="${show}". Created artificial target="${target}". Node:`,
        node
      );
    }
  }

  if (!!target) {
    node.attributes["target"] = target;
  }
}

export const handleAnchor: ToDataAndViewElementConfiguration = {
  toData: ({ node }) => {
    if (!hasHref(node)) {
      // Invalid state: We have an a-element without href which is not
      // supported by CoreMedia RichText DTD.
      node.replaceByChildren = true;
      return;
    }
    hrefToXLinkHref(node);
    targetToXLinkAttributes(node);
  },
  toView: ({ node }) => {
    xLinkHrefToHref(node);
    xLinkShowAndRoleToTarget(node);
  },
};
