/* eslint no-null/no-null: off */

import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";

/*
 * DevNote:
 *
 * Due to https://github.com/Microsoft/TypeScript/issues/14080 and `LinkFormView`
 * provided as so-called named export (see https://github.com/ckeditor/ckeditor5/issues/13864),
 * transparent augmentation is cumbersome.
 *
 * For Migrating to CKEditor 5 37.x, we decided to stick to a plain on-demand
 * casting.
 */

/**
 * Augmented properties for `LinkFormView`.
 */
export interface LinkFormViewAugmentation {
  /**
   * Name of the linked content.
   */
  // Must be non-optional due to: https://github.com/ckeditor/ckeditor5/issues/13965
  contentName: string | null | undefined;
  /**
   * URI path of linked content item.
   */
  // Must be non-optional due to: https://github.com/ckeditor/ckeditor5/issues/13965
  contentUriPath: string | null | undefined;
}

/**
 * Combined type for augmented `LinkFormView`.
 */
export type AugmentedLinkFormView = LinkFormView & LinkFormViewAugmentation;
