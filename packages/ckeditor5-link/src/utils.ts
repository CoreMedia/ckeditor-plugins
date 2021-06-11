export const LINK_BEHAVIOR = {
  DEFAULT: "default",
  OPEN_IN_NEW_TAB: "openInNewTab",
  OPEN_IN_CURRENT_TAB: "openInCurrentTab",
  SHOW_EMBEDDED: "showEmbedded",
  OPEN_IN_FRAME: "openInFrame",
  OPEN_IN_CURRENT_CONTEXT: "openInCurrentContext",
  OPEN_AT_PARENT: "openAtParent",
  UNKNOWN: "unknown",
};

export const linkTargetToUiValues = (linkTarget: string): { target: string; linkBehavior: string } => {
  // no linkTarget, return default state
  if (!linkTarget) {
    return {
      target: "",
      linkBehavior: LINK_BEHAVIOR.DEFAULT,
    };
  }

  const [linkBehavior, target] = linkTarget.split("_").filter((el) => el !== "");
  return {
    target: target || "",
    linkBehavior: _targetToLinkBehavior("_" + linkBehavior),
  };
};

const _targetToLinkBehavior = (target: string) => {
  switch (target) {
    case "":
      return LINK_BEHAVIOR.DEFAULT;
    case "_blank":
      return LINK_BEHAVIOR.OPEN_IN_NEW_TAB;
    case "_top":
      return LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB;
    case "_embed":
      return LINK_BEHAVIOR.SHOW_EMBEDDED;
    case "_self":
      return LINK_BEHAVIOR.OPEN_IN_CURRENT_CONTEXT;
    case "_parent":
      return LINK_BEHAVIOR.OPEN_AT_PARENT;
    case "_none":
      return LINK_BEHAVIOR.UNKNOWN;
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
      return "_top";
    case LINK_BEHAVIOR.SHOW_EMBEDDED:
      return "_embed";
    case LINK_BEHAVIOR.OPEN_IN_FRAME:
      return target ? target : "_other";
    case LINK_BEHAVIOR.OPEN_IN_CURRENT_CONTEXT:
      return "_self";
    case LINK_BEHAVIOR.OPEN_AT_PARENT:
      return "_parent";
    case LINK_BEHAVIOR.UNKNOWN:
      return "_none";
    default:
      throw new Error("unsupported linkBehavior set");
  }
};

export const getLinkBehaviorLabels = (t: any): { [key: string]: string } => {
  return {
    [LINK_BEHAVIOR.DEFAULT]: t("Default"),
    [LINK_BEHAVIOR.OPEN_IN_NEW_TAB]: t("Open in New Tab"),
    [LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB]: t("Open in Current Tab"),
    [LINK_BEHAVIOR.SHOW_EMBEDDED]: t("Show Embedded"),
    [LINK_BEHAVIOR.OPEN_IN_FRAME]: t("Open in Frame"),
    [LINK_BEHAVIOR.OPEN_IN_CURRENT_CONTEXT]: t("Open in Current Context"),
    [LINK_BEHAVIOR.OPEN_AT_PARENT]: t("Open at Parent"),
    [LINK_BEHAVIOR.UNKNOWN]: t("Unknown"),
  };
};
