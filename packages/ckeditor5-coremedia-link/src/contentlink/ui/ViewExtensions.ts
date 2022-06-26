import { isRaw } from "@coremedia/ckeditor5-common/AdvancedTypes";

export interface HasContentUriPath {
  contentUriPath: string | null;
}

export const hasContentUriPath = (value: unknown): value is HasContentUriPath => {
  return isRaw<HasContentUriPath>(value, "contentUriPath");
};

export interface HasContentName {
  contentName: string;
}

export const hasContentName = (value: unknown): value is HasContentName => {
  return isRaw<HasContentName>(value, "contentName") && typeof value.contentName === "string";
};
