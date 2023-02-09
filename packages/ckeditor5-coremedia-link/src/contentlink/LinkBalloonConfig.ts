import Config from "@ckeditor/ckeditor5-utils/src/config";

export const COREMEDIA_LINK_CONFIG_KEY = "coremedia:link";

/**
 * Configuration for link balloon adaptions
 */
export default interface LinkBalloonConfig {
  /**
   * Ids of DOM Elements the link balloon should not close when the Elements are clicked.
   *
   * This improves the work with Components and the link balloon.
   *
   * Example configuration:
   * ```
   * ClassicEditor
   *     .create( document.querySelector( '#editor' ), {
   *         // ...
   *        "coremedia:link": {
   *            linkBalloon: {
   *                keepOpenIds: ["example-to-keep-the-link-balloon-open-on-click"],
   *            },
   *        },
   *     } )
   *     .then( ... )
   *     .catch( ... );
   * ```
   */
  keepOpenIds: string[];
}

const linkBalloonConfig: LinkBalloonConfig = {
  keepOpenIds: [],
};

/**
 * Parses the editor configuration and creates an fills an internal LinkBalloonObject.
 *
 * Example configuration:
 * ```
 * "coremedia:link": {
 *            linkBalloon: {
 *                keepOpenIds: ["example-to-keep-the-link-balloon-open-on-click"],
 *            },
 *        },
 * ```
 *
 * @param config - editor configuration
 */
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
  linkBalloonConfig.keepOpenIds.push(...ids);
};

/**
 * Evaluates if at least one of the configured elements to keep the balloon open
 * for is part of the given element hierarchy.
 *
 * @param elementHierarchy - the element hierarchy to check if it contains one of the
 *                           configured element ids.
 */
export const keepOpen = (elementHierarchy: Element[]): boolean =>
  linkBalloonConfig.keepOpenIds.some((elementId) => {
    const element = document.getElementById(elementId);
    if (!element) {
      return false;
    }
    return elementHierarchy.includes(element);
  });
