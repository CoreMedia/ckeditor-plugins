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
 * Requires a Content URI Path, which can be handled by CoreMedia Studio to
 * represent a content. In case of the CKEditor model representation using a
 * colon within the content identifier, this is magically transformed to
 * a valid URI Path.
 *
 * @param str string to validate and possibly transform
 * @throws InvalidUriPathError in case of unmatched string
 */
const requireContentUriPath = (str: string): UriPath => {
  if (CONTENT_URI_PATH_REGEXP.test(str)) {
    return str;
  }

  const contentDataUriMatch: RegExpExecArray | null = CONTENT_CKE_MODEL_URI_REGEXP.exec(str);

  if (!contentDataUriMatch) {
    throw new InvalidUriPathError(`Invalid Content URI path or cannot convert to URI path: '${str}'.`)
  } else {
    return `${CONTENT_CKE_MODEL_URI_PREFIX}${contentDataUriMatch[1]}`;
  }
};

/**
 * Requires a Content URI as used within the CKEditor Model to represent a
 * content. In case of a Content URI path as used within CoreMedia Studio,
 * it will be magically transformed to a valid CKEditor Model URI.
 *
 * @param str string to validate and possibly transform
 * @throws InvalidCkeModelUriError in case of unmatched string
 */
const requireContentCkeModelUri = (str: string): ModelUri => {
  if (CONTENT_CKE_MODEL_URI_REGEXP.test(str)) {
    return str;
  }

  const contentDataUriMatch: RegExpExecArray | null = CONTENT_URI_PATH_REGEXP.exec(str);

  if (!contentDataUriMatch) {
    throw new InvalidCkeModelUriError(`Invalid Content data URI or cannot convert to data URI: '${str}'.`)
  } else {
    return `${CONTENT_URI_PATH_PREFIX}${contentDataUriMatch[1]}`;
  }
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
  requireContentUriPath,
  requireContentCkeModelUri,
  UriPath,
  ModelUri,
  InvalidUriPathError,
  InvalidCkeModelUriError,
};
