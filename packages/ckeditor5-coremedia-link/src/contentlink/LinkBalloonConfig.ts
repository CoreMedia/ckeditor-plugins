import { Config } from "@ckeditor/ckeditor5-utils";
import { EditorConfig } from "@ckeditor/ckeditor5-core/src/editor/editorconfig";

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
   *                keepOpen: {
   *                  ids: ["example-to-keep-the-link-balloon-open-on-click"],
   *                  classes: ["example-class],
   *                },
   *            },
   *        },
   *     } )
   *     .then( ... )
   *     .catch( ... );
   * ```
   */
  keepOpen: { ids: string[]; classes: string[] };
}

const linkBalloonConfig: LinkBalloonConfig = {
  keepOpen: { ids: [], classes: [] },
};

/**
 * Parses the editor configuration and fills an internal LinkBalloonConfig Object.
 *
 * Example configuration:
 * ```
 * "coremedia:link": {
 *            linkBalloon: {
 *                keepOpen: {
 *                  ids: ["example-to-keep-the-link-balloon-open-on-click"],
 *                  classes: ["example-class],
 *                },
 *            },
 *        },
 * ```
 *
 * @param config - editor configuration
 */
export const parseLinkBalloonConfig = (config: Config<EditorConfig>): void => {
  const balloonKeepOpenIdsRaw: unknown = config.get(`${COREMEDIA_LINK_CONFIG_KEY}.linkBalloon.keepOpen.ids`);
  const balloonKeepOpenClassesRaw: unknown = config.get(`${COREMEDIA_LINK_CONFIG_KEY}.linkBalloon.keepOpen.classes`);
  if (!balloonKeepOpenIdsRaw && !balloonKeepOpenClassesRaw) {
    return;
  }
  if (balloonKeepOpenIdsRaw && !Array.isArray(balloonKeepOpenIdsRaw)) {
    throw new Error("Wrong configuration, Array expected for link.linkBalloon.keepOpenIds");
  }
  if (balloonKeepOpenClassesRaw && !Array.isArray(balloonKeepOpenClassesRaw)) {
    throw new Error("Wrong configuration, Array expected for link.linkBalloon.keepOpenIds");
  }
  const rawIds: unknown[] = balloonKeepOpenIdsRaw as unknown[];
  const rawClasses: unknown[] = balloonKeepOpenClassesRaw as unknown[];
  const ids = rawIds.filter((id) => typeof id === "string").map((id) => id as string);
  const classes = rawClasses.filter((id) => typeof id === "string").map((id) => id as string);
  linkBalloonConfig.keepOpen.ids.push(...ids);
  linkBalloonConfig.keepOpen.classes.push(...classes);
};

/**
 * Evaluates if at least one of the configured elements to keep the balloon open
 * for is part of the given element hierarchy.
 *
 * @param elementHierarchy - the element hierarchy to check if it contains one of the
 *                           configured element ids or classes.
 */
export const keepOpen = (elementHierarchy: Element[]): boolean => {
  const elementHierarchyIds: string[] = elementHierarchy.map((element) => element.id).filter((id) => !!id);
  const idExistInHierarchy = linkBalloonConfig.keepOpen.ids.some((elementId) =>
    elementHierarchyIds.includes(elementId)
  );

  const elementHierarchyClassLists: DOMTokenList[] = elementHierarchy
    .map((element) => element.classList)
    .filter((classList) => !!classList);
  const classExistInHierarchy = linkBalloonConfig.keepOpen.classes.some((aClass) =>
    elementHierarchyClassLists.some((domTokenList) => domTokenList.contains(aClass))
  );
  return idExistInHierarchy || classExistInHierarchy;
};
