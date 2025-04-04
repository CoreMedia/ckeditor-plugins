import { addClass, addClassToTemplate, removeClass, removeClassFromTemplate } from "../utils";
import { View, Editor } from "ckeditor5";
import { getOptionalPlugin } from "@coremedia/ckeditor5-core-common";

/**
 * Adds or removes "cm-ck-link-view--show-content-link" to the form view's (and action view's) element or to the corresponding
 * template if the view is not rendered yet. This affects whether the content or external link field (or url preview) is shown.
 *
 * @param view - the view with the element the class should be added to or removed from
 * @param show - true to display the content link field, false to display the external link field (default).
 */
export const showContentLinkField = (view: View, show: boolean): void => {
  const showContentLinkFieldClass = "cm-ck-link-view--show-content-link";

  // already rendered. remove class from element
  if (view.element) {
    if (show) {
      addClass(view, showContentLinkFieldClass);
    } else {
      removeClass(view, showContentLinkFieldClass);
    }
  }

  // also remove class from template (for the next time the view gets rendered)
  if (show) {
    addClassToTemplate(view, showContentLinkFieldClass);
  } else {
    removeClassFromTemplate(view, showContentLinkFieldClass);
  }
};

/**
 * Closes the opened contextual balloon.
 *
 * @param editor - the editor
 */
export const closeContextualBalloon = (editor: Editor): void => {
  const balloon = getOptionalPlugin(editor, "ContextualBalloon");
  if (balloon) {
    while (balloon.visibleView) {
      // It is not enough to just hide the visibleView, we need to remove it.
      balloon.remove(balloon.visibleView);
    }
  }
};
