import { isRaw } from "@coremedia/ckeditor5-common/AdvancedTypes";

/**
 * Holds a reference to the UriPath of a content.
 */
export interface HasContentUriPath {
  /**
   * UriPath to a content.
   */
  contentUriPath: string | null;
}

/**
 * Type-Guard for `HasContentUriPath`.
 * @param value - if value fulfills interface
 */
export const hasContentUriPath = (value: unknown): value is HasContentUriPath => {
  return (
    isRaw<HasContentUriPath>(value, "contentUriPath") &&
    (value.contentUriPath === null || typeof value.contentUriPath === "string")
  );
};

/**
 * Provides the name of a content.
 */
export interface HasContentName {
  /**
   * Name of the content.
   */
  contentName: string;
}

/**
 * Type-Guard for `HasContentName`.
 * @param value - if value fulfills interface
 */
export const hasContentName = (value: unknown): value is HasContentName => {
  return isRaw<HasContentName>(value, "contentName") && typeof value.contentName === "string";
};

/**
 * Combined interface for providing the content's UriPath and name.
 */
export type HasContentUriPathAndName = HasContentUriPath & HasContentName;

/**
 * Type-Guard for `HasContentUriPathAndName`.
 * @param value - if value fulfills interface
 */
export const hasContentUriPathAndName = (value: unknown): value is HasContentUriPathAndName => {
  return hasContentUriPath(value) && hasContentName(value);
};
