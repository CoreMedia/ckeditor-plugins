const CONTENT_URI_PATH_REGEXP = /^content\/(?<id>\d+)*/;
const CONTENT_URI_PATH_PREFIX = "content/";
const CONTENT_CKE_MODEL_URI_REGEXP = /^content:(?<id>\d+)*/;
const CONTENT_CKE_MODEL_URI_PREFIX = "content:";

/**
 * Representation of content objects and similar in CoreMedia Studio.
 * Contents are for example represented as: `content/120`.
 */
type UriPath = string;
/**
 * Representation of content objects and similar in CKEditor Model.
 * Contents are for example represented as: `content:120`.
 */
type ModelUri = string;

/**
 * Validates, if the given value represents a URI path.
 *
 * @param value - value to validate
 */
const isUriPath = (value: unknown): value is string => {
  return typeof value === "string" && CONTENT_URI_PATH_REGEXP.test(value);
};

/**
 * Returns the numeric ID from a URI path.
 *
 * For convenience, it will provide any number unmodified, so that you can
 * use this method to resolve a possible URI path, if required.
 *
 * @param uriPath - URI path to return numeric ID from
 */
const numericId = (uriPath: number | UriPath): number => {
  if (typeof uriPath === "number") {
    // Convenience, just return the number.
    return uriPath;
  }
  const match = CONTENT_URI_PATH_REGEXP.exec(uriPath);
  if (!match) {
    return -1;
  }
  return parseInt(match[1]);
};

/**
 * Returns the content URI path for a given content ID.
 *
 * @param contentId - id to add to URI path
 */
const contentUriPath = (contentId: number): string => {
  return `${CONTENT_URI_PATH_PREFIX}${contentId}`;
};

/**
 * Requires a Content URI Path, which can be handled by CoreMedia Studio to
 * represent a content. In case of the CKEditor model representation using a
 * colon within the content identifier, this is magically transformed to
 * a valid URI Path.
 *
 * @param str - string to validate and possibly transform
 * @throws InvalidUriPathError in case of unmatched string
 */
const requireContentUriPath = (str: string): UriPath => {
  if (CONTENT_URI_PATH_REGEXP.test(str)) {
    return str;
  }

  const contentDataUriMatch: RegExpExecArray | null = CONTENT_CKE_MODEL_URI_REGEXP.exec(str);

  if (!contentDataUriMatch) {
    throw new InvalidUriPathError(`Invalid Content URI path or cannot convert to URI path: '${str}'.`);
  }

  const contentId: string = contentDataUriMatch[1];
  if (!contentId) {
    throw new InvalidUriPathError(`Invalid Content URI path or cannot convert to URI path: '${str}'.`);
  }

  return `${CONTENT_URI_PATH_PREFIX}${contentId}`;
};

/**
 * Requires a Content URI as used within the CKEditor Model to represent a
 * content. In case of a Content URI path as used within CoreMedia Studio,
 * it will be magically transformed to a valid CKEditor Model URI.
 *
 * @param uriPaths - string to validate and possibly transform
 * @throws InvalidCkeModelUriError in case of unmatched string
 */
const requireContentCkeModelUris = (uriPaths: Array<string>): Array<ModelUri> => {
  return uriPaths.map((uriPath) => {
    return requireContentCkeModelUri(uriPath);
  });
};

const requireContentCkeModelUri = (uriPath: string): ModelUri => {
  if (CONTENT_CKE_MODEL_URI_REGEXP.test(uriPath)) {
    return uriPath;
  }

  const contentDataUriMatch: RegExpExecArray | null = CONTENT_URI_PATH_REGEXP.exec(uriPath);

  if (!contentDataUriMatch) {
    throw new InvalidCkeModelUriError(`Invalid Content data URI or cannot convert to data URI: '${uriPath}'.`);
  }
  const contentId: string = contentDataUriMatch[1];
  if (!contentId) {
    throw new InvalidCkeModelUriError(`Invalid Content data URI or cannot convert to data URI: '${uriPath}'.`);
  }
  return `${CONTENT_CKE_MODEL_URI_PREFIX}${contentId}`;
};

class InvalidUriPathError extends Error {
  constructor(message?: string) {
    super(message);
    // https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html
    // https://www.dannyguo.com/blog/how-to-fix-instanceof-not-working-for-custom-errors-in-typescript/
    // https://ashsmith.io/handling-custom-error-classes-in-typescript
    // Do we need to handle the stacktrace? https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

class InvalidCkeModelUriError extends Error {
  constructor(message?: string) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export {
  CONTENT_CKE_MODEL_URI_PREFIX,
  CONTENT_CKE_MODEL_URI_REGEXP,
  CONTENT_URI_PATH_PREFIX,
  CONTENT_URI_PATH_REGEXP,
  contentUriPath,
  isUriPath,
  numericId,
  requireContentUriPath,
  requireContentCkeModelUri,
  requireContentCkeModelUris,
  UriPath,
  ModelUri,
  InvalidUriPathError,
  InvalidCkeModelUriError,
};
