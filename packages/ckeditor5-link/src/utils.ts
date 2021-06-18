import { Message } from "@ckeditor/ckeditor5-utils/translation-service";

export const LINK_BEHAVIOR = {
  DEFAULT: "default",
  OPEN_IN_NEW_TAB: "openInNewTab",
  OPEN_IN_CURRENT_TAB: "openInCurrentTab",
  SHOW_EMBEDDED: "showEmbedded",
  OPEN_IN_FRAME: "openInFrame",
};

/**
 * Transforms value of `linkTarget` from model in a way, that we can represent
 * it in the UI, having a drop-down for behavior-selection and a text-field
 * for any custom target.
 *
 * @param linkTarget value from model to transform
 */
export const linkTargetToUiValues = (linkTarget?: string): { target: string; linkBehavior: string } => {
  // no linkTarget, return default state
  if (!linkTarget) {
    return {
      target: "",
      linkBehavior: LINK_BEHAVIOR.DEFAULT,
    };
  }

  if (!linkTarget.includes("_")) {
    // no "_" found. return string as target and open in frame
    return {
      target: linkTarget,
      linkBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
    };
  }

  const ignoreEmpty = (el: string) => !!el;
  const [linkBehavior, target] = linkTarget.split("_").filter(ignoreEmpty);

  /*
   * We represent any other state as plain text in target field, assuming that customers don't want/need them,
   * but we must still be robust for contents from different editing applications.
   */
  let specialTarget = undefined;
  if (linkBehavior === "top" || linkBehavior === "parent" || linkBehavior === "none") {
    specialTarget = linkTarget;
  }
  return {
    target: specialTarget ? specialTarget : target || "",
    linkBehavior: _targetToLinkBehavior("_" + linkBehavior),
  };
};

const _targetToLinkBehavior = (target: string) => {
  switch (target) {
    case "":
      return LINK_BEHAVIOR.DEFAULT;
    case "_blank":
      return LINK_BEHAVIOR.OPEN_IN_NEW_TAB;
    case "_self":
      return LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB;
    case "_embed":
      return LINK_BEHAVIOR.SHOW_EMBEDDED;
    default:
      return LINK_BEHAVIOR.OPEN_IN_FRAME;
  }
};

/**
 * Transforms UI-state to a model value to be stored in `linkTarget`.
 *
 * The target is ignored by intention, if a behavior got selected, which
 * is not expected to come with a custom target. As a result, if such state
 * got loaded from CMS, it is _auto-repaired_ on save by removing the
 * unexpected target identifier.
 *
 * @param linkBehavior selected link behavior from drop-down
 * @param target specified target
 */
export const uiValuesToLinkTarget = (linkBehavior: string, target?: string): string => {
  switch (linkBehavior) {
    case LINK_BEHAVIOR.DEFAULT:
      return "";
    case LINK_BEHAVIOR.OPEN_IN_NEW_TAB:
      return "_blank";
    case LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB:
      return "_self";
    case LINK_BEHAVIOR.SHOW_EMBEDDED:
      return "_embed";
    case LINK_BEHAVIOR.OPEN_IN_FRAME:
      // This state is expected to have a target set to truthy value, which is
      // than taken as is as value for `linkTarget`. To represent a state, where
      // no explicit target has been given, an artificial keyword `_other`
      // is representing this state.
      return !target ? "_other" : target;
    default:
      throw new Error(`Unsupported linkBehavior: ${linkBehavior}`);
  }
};

/**
 * Provides a mapping from selectable link behaviors (drop-down) to their
 * localized label.
 *
 * @param t translate function
 */
export const getLinkBehaviorLabels = (
  t: (message: string | Message, values?: string | number | (string | number)[]) => string
): { [key: string]: string } => {
  return {
    [LINK_BEHAVIOR.OPEN_IN_NEW_TAB]: t("Open in New Tab"),
    [LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB]: t("Open in Current Tab"),
    [LINK_BEHAVIOR.SHOW_EMBEDDED]: t("Show Embedded"),
    [LINK_BEHAVIOR.OPEN_IN_FRAME]: t("Open in Frame"),
    [LINK_BEHAVIOR.DEFAULT]: t("Unspecified"),
  };
};
