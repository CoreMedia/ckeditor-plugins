export const LINK_BEHAVIOR = {
  DEFAULT: "default",
  OPEN_IN_NEW_TAB: "openInNewTab",
  OPEN_IN_CURRENT_TAB: "openInCurrentTab",
  SHOW_EMBEDDED: "showEmbedded",
  OPEN_IN_FRAME: "openInFrame",
};

export const linkTargetToUiValues = (linkTarget: string): { target: string; linkBehavior: string } => {
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

  const [linkBehavior, target] = linkTarget.split("_").filter((el) => el !== "");

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

export const uiValuesToLinkTarget = (linkBehavior: string, target: string): string => {
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
      return target ? target : "_other";
    default:
      throw new Error("unsupported linkBehavior set");
  }
};

export const getLinkBehaviorLabels = (t: any): { [key: string]: string } => {
  return {
    [LINK_BEHAVIOR.OPEN_IN_NEW_TAB]: t("Open in New Tab"),
    [LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB]: t("Open in Current Tab"),
    [LINK_BEHAVIOR.SHOW_EMBEDDED]: t("Show Embedded"),
    [LINK_BEHAVIOR.OPEN_IN_FRAME]: t("Open in Frame"),
    [LINK_BEHAVIOR.DEFAULT]: t("Unspecified"),
  };
};
