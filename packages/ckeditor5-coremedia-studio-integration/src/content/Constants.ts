/**
 * Artificial placeholder for the root folder. While in production setups,
 * it is expected, that a link to folders and especially the root-folder is
 * not allowed (for link insertion scenarios such as drag and drop), we should
 * handle such empty name in same way.
 *
 * There is a known issue for CoreMedia CMS with ID CMS-19873, that handling
 * for this corner case should be enhanced.
 *
 * This placeholder is not meant to be used for `ContentLinkView`. An
 * alternative display should be added as part of CMS-19873.
 */
export const ROOT_NAME = "<root>";

/**
 * Data-Type used in instances of `DataTransfer` objects to denote a list of
 * contained URI-Paths.
 */
export const URI_LIST_DATA = "cm-studio-rest/uri-list";

/**
 * Key for the context data in the config of an Editor
 */
export const COREMEDIA_CONTEXT_KEY = "coremedia:context";
