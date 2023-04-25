import { AugmentedLinkActionsView } from "./AugmentedLinkActionsView";
import { AugmentedLinkFormView } from "./AugmentedLinkFormView";
import { ViewWithCssTransitionDisabler } from "@ckeditor/ckeditor5-ui";
import { LinkUI } from "@ckeditor/ckeditor5-link";

/**
 * Augmented properties for `LinkUI`.
 */
export interface LinkUIAugmentation {
  actionsView: AugmentedLinkActionsView | null;
  formView: (AugmentedLinkFormView & ViewWithCssTransitionDisabler) | null;
}

/**
 * Combined type for augmented `LinkUI`.
 */
export type AugmentedLinkUI = Omit<LinkUI, "actionsView" | "formView"> & LinkUIAugmentation;

/**
 * Cast to `AugmentedLinkUI` without explicit checks applied.
 *
 * @param linkUI - LinkUI to augment
 */
export const asAugmentedLinkUI = (linkUI: LinkUI): AugmentedLinkUI =>
  // We will just ignore the error for now, here. It is mostly dedicated to
  // https://github.com/ckeditor/ckeditor5/issues/13965, that we cannot set
  // properties to use in the context of observables as optional. Instead, we
  // need to make them `undefined´ as an explicitly selected type option, which
  // again would require properly setting defaults for augmented properties here
  // to `undefined`.
  //
  // If decision for the given issue is to support optional properties, we
  // expect that we can just remove the following ts-expect-error.
  // @ts-expect-error - Wait for decision on https://github.com/ckeditor/ckeditor5/issues/13965
  linkUI;
