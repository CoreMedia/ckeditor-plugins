import View from "@ckeditor/ckeditor5-ui/src/view";
import { addClass, addClassToTemplate, removeClass, removeClassFromTemplate } from "../utils";

/**
 * Adds or removes "cm-ck-link-form-view--show-internal-link" to the form view's element or to the form view's
 * template if the view is not rendered yet. This affects whether the internal or external link field is shown.
 *
 * @param view the view with the element the class should be added to or removed from
 * @param show true to display the internal link field, false to display the external link field (default).
 */
export const showInternalLinkField = (view: View, show: boolean): void => {
  const showInternalLinkFieldClass = "cm-ck-link-form-view--show-internal-link";

  // already rendered. remove class from element
  if (view.element) {
    if (show) {
      addClass(view, showInternalLinkFieldClass);
    } else {
      removeClass(view, showInternalLinkFieldClass);
    }
  }

  // also remove class from template (for the next time the view gets rendered)
  if (show) {
    addClassToTemplate(view, showInternalLinkFieldClass);
  } else {
    removeClassFromTemplate(view, showInternalLinkFieldClass);
  }
};
