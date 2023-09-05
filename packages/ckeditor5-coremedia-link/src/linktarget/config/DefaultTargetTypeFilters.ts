import { DefaultLinkType } from "./LinkTargetDefaultRuleDefinition";

/**
 * Checks if a given url is an external link.
 *
 * @param url - the href attribute of the link
 * @returns whether the filter applies on the given url
 */
const externalLinkFilter = (url: string) => (url ? url.startsWith("https://") : false);

/**
 * Checks if a given url is a (internal) content link.
 *
 * @param url - the href attribute of the link
 * @returns whether the filter applies on the given url
 */
const contentLinkFilter = (url: string) => (url ? url.startsWith("content") : false);

/**
 * Returns a matching filter
 * @param type - the type of the link
 * @returns the matching filter
 */
export const getFilterByType = (type: DefaultLinkType): ((url: string) => boolean) | undefined => {
  switch (type) {
    case "externalLink":
      return externalLinkFilter;
    case "contentLink":
      return contentLinkFilter;
    default:
      return undefined;
  }
};
