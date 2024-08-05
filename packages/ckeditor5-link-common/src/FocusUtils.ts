import { View } from "ckeditor5";
// LinkActionsView: See ckeditor/ckeditor5#12027.
import LinkActionsView from "@ckeditor/ckeditor5-link/src/ui/linkactionsview";
// LinkFormView: See ckeditor/ckeditor5#12027.
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import { hasRequiredInternalFocusablesProperty } from "./HasFocusables";

/**
 * Utility function to handle focus tracking for extended linkViews.
 * The LinkFormView and LinkActionsView do not provide any interface to adjust the focus tracking
 * after manually adding buttons to the views.
 *
 * This utility helps to add new components to the focus tracking.
 * It adds the given views (e.g., buttons) to the view's focusTracker and inserts the views to the
 * internal _focusables collection by removing all existing views and re-adding all views again in
 * the correct order.
 *
 * @param parentView - the LinkFormView or LinkActionsView to change
 * @param childViews - the new views to add to the parentView
 * @param anchorView - an existing view, already present in the parentView
 * @param positionRelativeToAnchorView - defines whether to add the childViews before or after the anchorView in focus order
 */
export const handleFocusManagement = (
  parentView: LinkActionsView | LinkFormView,
  childViews: View[],
  anchorView: View,
  positionRelativeToAnchorView: "before" | "after" = "after",
): void => {
  addViewsToFocusTracker(parentView, childViews);
  const existingChildViews = removeExistingFocusables(parentView);
  existingChildViews.forEach((existingView: View) => {
    if (existingView === anchorView && positionRelativeToAnchorView === "before") {
      addViewsToFocusables(parentView, childViews);
    }
    addViewsToFocusables(parentView, [existingView]);
    if (existingView === anchorView && positionRelativeToAnchorView === "after") {
      addViewsToFocusables(parentView, childViews);
    }
  });
};
const addViewsToFocusables = (parentView: LinkActionsView | LinkFormView, childViews: View[]): void => {
  const internalParentView: unknown = parentView;
  if (!hasRequiredInternalFocusablesProperty(internalParentView)) {
    return;
  }
  childViews.forEach((view: View) => {
    if (view.element) {
      internalParentView._focusables.add(view);
    }
  });
};
const addViewsToFocusTracker = (parentView: LinkActionsView | LinkFormView, childViews: View[]): void => {
  childViews.forEach((view: View) => {
    if (view.element) {
      parentView.focusTracker.add(view.element);
    }
  });
};
const removeExistingFocusables = (view: LinkActionsView | LinkFormView): View[] => {
  const internalView: unknown = view;
  if (!hasRequiredInternalFocusablesProperty(internalView)) {
    return [];
  }
  const removedViews: View[] = [];
  const viewArray = Array.from(internalView._focusables);
  viewArray.forEach((childView) => {
    internalView._focusables.remove(childView);
    removedViews.push(childView);
  });
  return removedViews;
};
