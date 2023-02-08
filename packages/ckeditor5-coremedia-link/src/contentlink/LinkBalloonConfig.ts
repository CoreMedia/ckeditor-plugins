import Config from "@ckeditor/ckeditor5-utils/src/config";

export const COREMEDIA_LINK_CONFIG_KEY = "coremedia:link";

const keepOpenIds: string[] = [];

export const parseLinkBalloonConfig = (config: Config): void => {
  const balloonKeepOpenIdsRaw: unknown = config.get(`${COREMEDIA_LINK_CONFIG_KEY}.linkBalloon.keepOpenIds`);
  if (!balloonKeepOpenIdsRaw) {
    return;
  }
  if (!Array.isArray(balloonKeepOpenIdsRaw)) {
    throw new Error("Wrong configuration, Array expexted for link.linkBalloon.keepOpenIds");
  }
  const rawIds: unknown[] = balloonKeepOpenIdsRaw as unknown[];
  const ids = rawIds.filter((id) => typeof id === "string").map((id) => id as string);
  keepOpenIds.push(...ids);
};

export const keepOpen = (elementHierarchy: Element[]): boolean =>
  keepOpenIds.some((elementId) => {
    const element = document.getElementById(elementId);
    if (!element) {
      return false;
    }
    return elementHierarchy.includes(element);
  });
