import { FocusTracker, ViewCollection } from "ckeditor5";
import { IncompatibleInternalApiUsageError } from "@coremedia/ckeditor5-common";

/**
 * Internal API of `LinkFormView` and `LinkActionsView` we need to expose
 * in some contexts.
 */
export interface HasFocusables {
  readonly _focusables: ViewCollection;
}

export interface HasFocusTracker {
  readonly focusTracker: FocusTracker;
}

const isHasFocusables = (value: unknown): value is HasFocusables =>
  typeof value === "object" && !!value && "_focusables" in value && value._focusables instanceof ViewCollection;

/**
 * Validates that the given value has the required private property
 * `_focusables`.
 *
 * As side effect raises an error on incompatible change of CKEditor 5
 * (internal) API.
 *
 * @param value - value to type guard
 */
export const hasRequiredInternalFocusablesProperty = (value: unknown): value is HasFocusables => {
  const result = isHasFocusables(value);
  if (!result) {
    console.debug(
      "hasRequiredInternalFocusablesProperty: Required internal property _focusables missing or of unexpected type.",
      value
    );
    throw new IncompatibleInternalApiUsageError(
      "Required internal API property _focusables missing or of unexpected type."
    );
  }
  return result;
};
