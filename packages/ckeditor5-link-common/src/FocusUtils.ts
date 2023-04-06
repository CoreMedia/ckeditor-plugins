import { View, ViewCollection } from "@ckeditor/ckeditor5-ui";
import LinkActionsView from "@ckeditor/ckeditor5-link/src/ui/linkactionsview";
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";

/**
 * Extended LinkView type to use when managing focus tracking in LinkFormView and LinkActionsView.
 * Use if you need to access the internal _focusable property.
 */
export type LinkViewWithFocusables = (LinkActionsView | LinkFormView) & { _focusables: ViewCollection };

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
  parentView: LinkViewWithFocusables,
  childViews: View[],
  anchorView: View,
  positionRelativeToAnchorView: "before" | "after" = "after"
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

const addViewsToFocusables = (parentView: LinkViewWithFocusables, childViews: View[]): void => {
  childViews.forEach((view: View) => {
    if (view.element) {
      //@ts-expect-error _focusable is private api.
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
      parentView._focusables.add(view);
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

const removeExistingFocusables = (view: LinkViewWithFocusables): View[] => {
  const removedViews: View[] = [];
  //@ts-expect-error _focusable is private api
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const viewArray = Array.from(view._focusables);
  viewArray.forEach((childView: unknown) => {
    //@ts-expect-error _focusable is private api
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    view._focusables.remove(childView);
    removedViews.push(childView as View);
  });
  return removedViews;
};
