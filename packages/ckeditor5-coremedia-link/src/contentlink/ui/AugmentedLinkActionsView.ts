import type { LinkUI } from "ckeditor5";

/*
 * DevNote:
 *
 * Due to https://github.com/Microsoft/TypeScript/issues/14080 and `LinkActionsView`
 * provided as so-called named export (see https://github.com/ckeditor/ckeditor5/issues/13864),
 * transparent augmentation is cumbersome.
 *
 * For Migrating to CKEditor 5 37.x, we decided to stick to a plain on-demand
 * casting.
 */

/**
 * Augmented properties for `LinkActionsView`.
 */
export interface LinkActionsViewAugmentation {
  /**
   * URI path of linked content item.
   */
  // Must be non-optional due to: https://github.com/ckeditor/ckeditor5/issues/13965
  contentUriPath: string | null | undefined;
}

export type LinkActionsView = NonNullable<LinkUI["toolbarView"]>;

/**
 * Combined type for augmented `LinkActionsView`.
 */
export type AugmentedLinkActionsView = LinkActionsView & LinkActionsViewAugmentation;
