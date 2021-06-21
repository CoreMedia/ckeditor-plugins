import { Message } from "@ckeditor/ckeditor5-utils/translation-service";

export const LINK_BEHAVIOR = {
  UNSPECIFIED: "unspecified",
  OPEN_IN_NEW_TAB: "openInNewTab",
  OPEN_IN_CURRENT_TAB: "openInCurrentTab",
  SHOW_EMBEDDED: "showEmbedded",
  OPEN_IN_FRAME: "openInFrame",
};

const UnsupportedShow = Symbol("Unsupported Show");
type UnsupportedShowType = typeof UnsupportedShow;

/**
 * Transforms value of `linkTarget` from model in a way, that we can represent
 * it in the UI, having a drop-down for behavior-selection and a text-field
 * for any custom target.
 *
 * @param linkTarget value from model to transform
 */
export const linkTargetToUiValues = (linkTarget?: string): { target: string; linkBehavior: string } => {
  // no linkTarget, link in unspecified
  if (!linkTarget) {
    return {
      target: "",
      linkBehavior: LINK_BEHAVIOR.UNSPECIFIED,
    };
  }

  const modelMatcher = /^(?<show>_[^_]+)(?:_(?<role>.*))?$/;
  const matchResult: RegExpExecArray | null = modelMatcher.exec(linkTarget);

  if (!matchResult) {
    // no "_" found. return string as target and open in frame
    return {
      target: linkTarget,
      linkBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
    };
  }

  /**
   * Not yet value for `xlink:show` but may be transformed to such a value
   * by mapping.
   */
  const show = matchResult[1];
  const role = matchResult[2];

  const linkBehavior = _showToLinkBehavior(show);

  if (linkBehavior === UnsupportedShow) {
    return {
      target: linkTarget,
      linkBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
    };
  }

  /*
   * "_other" is only supported as full-match (as it represents a state, where
   * xlink:role has not been set). Thus, if any role is set, we must take it as
   * full target value and not stripping `_other` from the target value.
   */
  if (linkBehavior === "_other") {
    if (!!role) {
      // Misused "_other" placeholder (denoting xlink:show=other without expected role.
      // In this case, we assume, that it is a completely custom target.
      return {
        target: linkTarget,
        linkBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
      };
    }
    return {
      target: "",
      linkBehavior: LINK_BEHAVIOR.OPEN_IN_FRAME,
    };
  }

  return {
    target: role || "",
    linkBehavior: linkBehavior,
  };
};

const _showToLinkBehavior = (show: string): string | UnsupportedShowType => {
  switch (show) {
    case "_blank":
      return LINK_BEHAVIOR.OPEN_IN_NEW_TAB;
    case "_self":
      return LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB;
    case "_embed":
      return LINK_BEHAVIOR.SHOW_EMBEDDED;
    case "_role":
      // Artificial state, where model only denotes role but no show parameter.
      // We "repair" this to be "open in frame" with the given role.
      return LINK_BEHAVIOR.OPEN_IN_FRAME;
    case "_other":
      // Artificial state, where model only denotes xlink:show=other but
      // without an expected role.
      return LINK_BEHAVIOR.OPEN_IN_FRAME;
    default:
      return UnsupportedShow;
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
    case LINK_BEHAVIOR.UNSPECIFIED:
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
    [LINK_BEHAVIOR.UNSPECIFIED]: t("Unspecified"),
  };
};
