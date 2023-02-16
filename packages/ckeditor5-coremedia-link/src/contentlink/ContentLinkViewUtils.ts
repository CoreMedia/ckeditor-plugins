import View from "@ckeditor/ckeditor5-ui/src/view";
import { addClass, addClassToTemplate, removeClass, removeClassFromTemplate } from "../utils";
import { ifPlugin } from "@coremedia/ckeditor5-core-common/Plugins";
import { ContextualBalloon } from "@ckeditor/ckeditor5-ui";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";

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
 * Closes the currently opened contextual balloon.
 *
 * @param editor - the editor
 */
export const closeContextualBalloon = (editor: Editor): void => {
  void ifPlugin(editor, ContextualBalloon).then((balloon) => {
    while (balloon.visibleView) {
      // it is not sufficient to just hide the visibleView, we need to remove it
      balloon.remove(balloon.visibleView);
    }
  });
};
