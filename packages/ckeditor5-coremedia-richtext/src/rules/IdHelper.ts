const COREMEDIA_SCHEME = "coremedia";
const CAP_PREFIX = `${COREMEDIA_SCHEME}:///cap/`;
const BLOB = "blob/";
const CONTENT = "content/";
const CONTENT_ID_PREFIX = `${CAP_PREFIX}${CONTENT}`;
const BLOB_ID_PREFIX = `${CAP_PREFIX}${BLOB}`;
const CONTENT_BLOB_ID_PREFIX = `${BLOB_ID_PREFIX}${CONTENT}`;
const CONTENT_ID_PATTERN = new RegExp(`^${CONTENT_ID_PREFIX}(?<id>\\d+)$`);
const CONTENT_BLOB_ID_PATTERN = new RegExp(`^${CONTENT_BLOB_ID_PREFIX}(?<id>\\d+)#(?<property>\\S+)$`);

/**
 * Result from parsing a content ID from regular expression.
 */
interface ContentIdParseResult {
  /**
   * Content ID number as string.
   */
  id: string;
}

/**
 * Result from parsing a content Blob ID from regular expression.
 */
interface ContentBlobIdParseResult {
  /**
   * Content ID number as string.
   */
  id: string;
  /**
   * Property name where the blob is stored in.
   */
  property: string;
}

/**
 * Result from parsing a content ID.
 */
interface ContentIdResult {
  /**
   * Numeric Content ID.
   */
  id: number;
}

/**
 * Result from parsing a content Blob ID.
 */
interface ContentBlobIdResult {
  /**
   * Numeric Content ID.
   */
  id: number;
  /**
   * Property name where the blob is stored in.
   */
  property: string;
}

/**
 * Type guard if regular expression result denotes a content ID.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isContentIdParseResult = (result: any): result is ContentIdParseResult => {
  if ("id" in result) {
    return typeof result.id === "string";
  }
  return false;
};

/**
 * Type guard if regular expression result denotes a content blob ID.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isContentBlobIdParseResult = (result: any): result is ContentBlobIdParseResult => {
  if ("id" in result && "property" in result) {
    return typeof result.id === "string" && typeof result.property === "string";
  }
  return false;
};

/**
 * Parses the given ID to a content ID.
 * @example
 * ```
 * const result = parseContentId("coremedia:///cap/content/2");
 * ```
 * @param contentId - id to parse
 * @returns content ID; `undefined` if string does not represent a content ID.
 */
const parseContentId = (contentId: string): ContentIdResult | undefined => {
  const match = CONTENT_ID_PATTERN.exec(contentId);
  if (match) {
    const { groups } = match;
    if (isContentIdParseResult(groups)) {
      return {
        id: parseInt(groups.id),
      };
    }
  }
  return undefined;
};

/**
 * Parses the given ID to a content blob ID.
 * @example
 * ```
 * const result = parseContentBlobId("coremedia:///cap/blob/content/2#prop");
 * ```
 * @param blobId - id to parse
 * @returns content ID; `undefined` if string does not represent a content ID.
 */
const parseContentBlobId = (blobId: string): ContentBlobIdResult | undefined => {
  const match = CONTENT_BLOB_ID_PATTERN.exec(blobId);
  if (match) {
    const { groups } = match;
    if (isContentBlobIdParseResult(groups)) {
      return {
        id: parseInt(groups.id),
        property: groups.property,
      };
    }
  }
  return undefined;
};

/**
 * Possibly formats a new link, if the given link is either a
 * CoreMedia Unified API (UAPI) Content or Content Blob Identifier. Otherwise,
 * returns the given string unmodified.
 *
 * @example
 * ```
 * formatLink("https://example.org")
 * => "https://example.org"
 * ```
 *
 * @example
 * ```
 * formatLink("content/2")
 * => "content/2"
 * ```
 *
 * @example
 * ```
 * formatLink("coremedia:///cap/content/2")
 * => "content/2"
 * ```
 *
 * @example
 * ```
 * formatLink("content/2#properties.data")
 * => "content/2#properties.data"
 * ```
 *
 * @example
 * ```
 * formatLink("coremedia:///cap/blob/content/2#data")
 * => "content/2#properties.data"
 * ```
 *
 * @param href - link href to possibly adjust
 * @returns the original href or in case of UAPI references, references suitable for use in Studio Client.
 */
const formatLink = (href: string): string => {
  // Fast exit: No need to add additional parsing.
  if (!href.startsWith(COREMEDIA_SCHEME)) {
    return href;
  }
  const contentBlobId = parseContentBlobId(href);
  if (contentBlobId) {
    return `content/${contentBlobId.id}#properties.${contentBlobId.property}`;
  }
  const contentId = parseContentId(href);
  if (contentId) {
    return `content/${contentId.id}`;
  }
  return href;
};

export { formatLink };
