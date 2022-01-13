import View from "@ckeditor/ckeditor5-ui/src/view";
import { addClass, addClassToTemplate, removeClass, removeClassFromTemplate } from "../utils";
import { serviceAgent } from "@coremedia/service-agent";
import WorkAreaService from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/WorkAreaService";
import WorkAreaServiceDescriptor from "@coremedia/ckeditor5-coremedia-studio-integration/content/WorkAreaServiceDescriptor";

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

export const openInTab = (uriPath: string): void => {
  uriPath = uriPath.replace(":", "/");
  serviceAgent
    .fetchService<WorkAreaService>(new WorkAreaServiceDescriptor())
    .then((workAreaService: WorkAreaService): void => {
      workAreaService.openEntitiesInTabs([uriPath]);
    })
    .catch((): void => {
      console.warn("WorkArea Service not available");
    });
};
