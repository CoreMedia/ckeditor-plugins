import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/index";
import createContentLinkView from "./ContentLinkViewFactory";
import { CONTENT_CKE_MODEL_URI_REGEXP } from "@coremedia/coremedia-studio-integration/content/UriPath";
import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
import ContentView from "./ContentView";
import {
  extractContentCkeModelUri,
  receiveUriPathFromDragData,
} from "@coremedia/coremedia-studio-integration/content/DragAndDropUtils";
import { showContentLinkField } from "../ContentLinkViewUtils";
import { serviceAgent } from "@coremedia/studio-apps-service-agent";
import RichtextConfigurationService from "@coremedia/coremedia-studio-integration/content/RichtextConfigurationService";

/**
 * Extends the form view for Content link display. This includes:
 *
 * * render name of linked content (or placeholder for unreadable content)
 * * allow dropping of drag items into the URL field
 * * provide `onClick` handler to open a content in a new Studio tab
 */
class ContentLinkFormViewExtension extends Plugin {
  static readonly pluginName: string = "ContentLinkFormViewExtension";
  static readonly #logger: Logger = LoggerProvider.getLogger(ContentLinkFormViewExtension.pluginName);

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [LinkUI];
  }

  init(): Promise<void> | null {
    const startTimestamp = performance.now();

    ContentLinkFormViewExtension.#logger.debug(`Initializing ${ContentLinkFormViewExtension.pluginName}...`);

    const editor = this.editor;
    const linkUI: LinkUI = <LinkUI>editor.plugins.get(LinkUI);

    this.#extendView(linkUI);

    ContentLinkFormViewExtension.#logger.debug(
      `Initialized ${ContentLinkFormViewExtension.pluginName} within ${performance.now() - startTimestamp} ms.`
    );

    return null;
  }

  #extendView(linkUI: LinkUI): void {
    const formView = linkUI.formView;
    const contentLinkView = createContentLinkView(this.editor.locale, linkUI);

    formView.once("render", () => ContentLinkFormViewExtension.#render(contentLinkView, linkUI));
    /*
     * Workaround to reset the values of linkBehavior and target fields if modal
     * is canceled and reopened after changes have been made. See related issues:
     * ckeditor/ckeditor5-link#78 (now: ckeditor/ckeditor5#4765) and
     * ckeditor/ckeditor5-link#123 (now: ckeditor/ckeditor5#4793)
     */

    if (!(linkUI as any)["_events"] || !(linkUI as any)["_events"].hasOwnProperty("_addFormView")) {
      //@ts-ignore
      linkUI.decorate("_addFormView");
    }

    this.listenTo(linkUI, "_addFormView", () => {
      const { value: href } = <HTMLInputElement>formView.urlInputView.fieldView.element;

      linkUI.set({
        contentUriPath: CONTENT_CKE_MODEL_URI_REGEXP.test(href) ? href : null,
      });
    });

    /*
     * We need to update the visibility of the inputs when the value of the content link changes
     * If the value was removed: show external link field, otherwise show the content link field
     */
    linkUI.on("change:contentUriPath", (evt) => {
      const value = evt.source.contentUriPath;
      // content link value has changed. set urlInputView accordingly
      // value is null if it was set by cancelling and reopening the dialog, resetting the dialog should not
      // re-trigger a set of utlInputView here
      if (value !== null) {
        formView.urlInputView.fieldView.set({
          value: value || "",
        });
      }

      // set visibility of url and content field
      showContentLinkField(formView, value);
      showContentLinkField(linkUI.actionsView, value);
    });
  }

  static #render(contentLinkView: LabeledFieldView<ContentView>, linkUI: LinkUI): void {
    const formView = linkUI.formView;
    ContentLinkFormViewExtension.#logger.debug("Rendering ContentView and register listeners");
    formView.registerChild(contentLinkView);
    ContentLinkFormViewExtension.#logger.debug("Is ContentView already rendered: " + contentLinkView.isRendered);
    if (!contentLinkView.isRendered) {
      contentLinkView.render();
    }
    formView.element.insertBefore(contentLinkView.element, formView.urlInputView.element.nextSibling);
    ContentLinkFormViewExtension.#addDragAndDropListeners(contentLinkView, linkUI);
  }

  static #addDragAndDropListeners(contentLinkView: LabeledFieldView<ContentView>, linkUI: LinkUI): void {
    ContentLinkFormViewExtension.#logger.debug("Adding drag and drop listeners to formView and contentLinkView");
    contentLinkView.fieldView.element.addEventListener("drop", (dragEvent: DragEvent) => {
      ContentLinkFormViewExtension.#onDropOnLinkField(dragEvent, linkUI);
    });
    contentLinkView.fieldView.element.addEventListener("dragover", ContentLinkFormViewExtension.#onDragOverLinkField);

    linkUI.formView.urlInputView.fieldView.element.addEventListener("drop", (dragEvent: DragEvent) => {
      ContentLinkFormViewExtension.#onDropOnLinkField(dragEvent, linkUI);
    });
    linkUI.formView.urlInputView.fieldView.element.addEventListener(
      "dragover",
      ContentLinkFormViewExtension.#onDragOverLinkField
    );
    ContentLinkFormViewExtension.#logger.debug("Finished adding drag and drop listeners.");
  }

  static #onDropOnLinkField(
    dragEvent: DragEvent,
    linkUI: LinkUI,
  ): void {
    const contentCkeModelUri = extractContentCkeModelUri(dragEvent);
    dragEvent.preventDefault();
    if (contentCkeModelUri !== null) {
      ContentLinkFormViewExtension.#setDataAndSwitchToContentLink(linkUI, contentCkeModelUri);
      return;
    }
    if (dragEvent.dataTransfer === null) {
      return;
    }

    const data: string = dragEvent.dataTransfer.getData("text/plain");
    if (data) {
      ContentLinkFormViewExtension.#setDataAndSwitchToExternalLink(linkUI, data);
    }
    return;
  }

  static #setDataAndSwitchToExternalLink(
    linkUI: LinkUI,
    data: string
  ): void {
    linkUI.formView.urlInputView.fieldView.set("value", data);
    linkUI.set("contentUriPath", null);
    showContentLinkField(linkUI.formView, false);
    showContentLinkField(linkUI.actionsView, false);
  }

  static #setDataAndSwitchToContentLink(
    linkUI: LinkUI,
    data: string
  ): void {
    linkUI.formView.urlInputView.fieldView.set("value", null);
    linkUI.set("contentUriPath", data);
    showContentLinkField(linkUI.formView, true);
    showContentLinkField(linkUI.actionsView, true);
  }

  /**
   * On dragover we have to decide if a drop is allowed here or not.
   * A drop must be allowed if it is any URL (for external links) or if it is a content which is allowed to drop.
   * A content is allowed to drop if the DragDropService has any data and if the given content from DragDropService is
   * a CMLinkable.
   *
   * @param dragEvent the drag event.
   * @private
   */
  static #onDragOverLinkField(dragEvent: DragEvent): void {
    dragEvent.preventDefault();
    if (!dragEvent.dataTransfer) {
      return;
    }

    const contentUriPath: string | null = receiveUriPathFromDragData();
    if (!contentUriPath) {
      ContentLinkFormViewExtension.#logger.debug(
        "DragOverEvent: No uri received from DragDropService, assume that is any text (like an url) and allow it"
      );
      dragEvent.dataTransfer.dropEffect = "copy";
      return;
    }

    ContentLinkFormViewExtension.#logger.debug(
      "DragOverEvent: Received uri path from DragDropService: " + contentUriPath
    );
    dragEvent.dataTransfer.dropEffect = "none";
    const service = serviceAgent.getService<RichtextConfigurationService>("mockRichtextConfigurationService");
    if (!service) {
      ContentLinkFormViewExtension.#logger.warn(
        "No RichtextConfigurationService found, can't evaluate properly if drop is allowed"
      );
      return;
    }

    service.hasLinkableType(contentUriPath).then((isLinkable) => {
      if (dragEvent.dataTransfer === null) {
        return;
      }
      if (isLinkable) {
        ContentLinkFormViewExtension.#logger.debug(
          "DragOverEvent: Received content uri is a linkable and drop is allowed"
        );
        dragEvent.dataTransfer.dropEffect = "copy";
        return;
      }
      ContentLinkFormViewExtension.#logger.debug(
        "DragOverEvent: Received content uri is NOT linkable and drop is therefore NOT allowed"
      );
      dragEvent.dataTransfer.dropEffect = "none";
    });
  }
}

export default ContentLinkFormViewExtension;
