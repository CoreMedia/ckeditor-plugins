import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import Logger from "@coremedia/coremedia-utils/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/logging/LoggerProvider";
import createContentLinkView from "./ContentLinkViewFactory";
import { CONTENT_CKE_MODEL_URI_REGEXP } from "@coremedia/coremedia-studio-integration/content/UriPath";
import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
import {
  extractContentCkeModelUri,
  extractContentUriPath,
  receiveUriPathFromDragData,
} from "@coremedia/coremedia-studio-integration/content/DragAndDropUtils";
import { showContentLinkField } from "../ContentLinkViewUtils";
import ContentLinkView from "./ContentLinkView";
import DragDropAsyncSupport from "@coremedia/coremedia-studio-integration/content/DragDropAsyncSupport";

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
    const logger = ContentLinkFormViewExtension.#logger;
    const startTimestamp = performance.now();

    logger.debug(`Initializing ${ContentLinkFormViewExtension.pluginName}...`);

    const editor = this.editor;
    const linkUI: LinkUI = <LinkUI>editor.plugins.get(LinkUI);
    const linkCommand = editor.commands.get("link");

    linkUI.formView.set({
      contentUriPath: undefined,
    });

    linkUI.formView.bind("contentUriPath").to(linkCommand, "value", (value: string) => {
      return CONTENT_CKE_MODEL_URI_REGEXP.test(value) ? value : undefined;
    });

    this.#extendView(linkUI);

    logger.debug(
      `Initialized ${ContentLinkFormViewExtension.pluginName} within ${performance.now() - startTimestamp} ms.`
    );

    return null;
  }

  #extendView(linkUI: LinkUI): void {
    const formView = linkUI.formView;
    const contentLinkView = createContentLinkView(this.editor.locale, linkUI);

    formView.once("render", () => ContentLinkFormViewExtension.#render(contentLinkView, linkUI));
    linkUI.formView.on("cancel", () => {
      const initialValue: string = <string>this.editor.commands.get("link")?.value;
      linkUI.formView.set({
        contentUriPath: CONTENT_CKE_MODEL_URI_REGEXP.test(initialValue) ? initialValue : null,
      });
    });
  }

  static #render(contentLinkView: LabeledFieldView<ContentLinkView>, linkUI: LinkUI): void {
    const logger = ContentLinkFormViewExtension.#logger;
    const formView = linkUI.formView;

    logger.debug("Rendering ContentLinkView and registering listeners.");
    formView.registerChild(contentLinkView);

    if (!contentLinkView.isRendered) {
      logger.debug(`ContentLinkView not rendered yet. Triggering render().`);
      contentLinkView.render();
    }

    formView.element.insertBefore(contentLinkView.element, formView.urlInputView.element.nextSibling);
    ContentLinkFormViewExtension.#addDragAndDropListeners(contentLinkView, linkUI);
  }

  static #addDragAndDropListeners(contentLinkView: LabeledFieldView<ContentLinkView>, linkUI: LinkUI): void {
    const logger = ContentLinkFormViewExtension.#logger;
    logger.debug("Adding drag and drop listeners to formView and contentLinkView");
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
    logger.debug("Finished adding drag and drop listeners.");
  }

  static #onDropOnLinkField(dragEvent: DragEvent, linkUI: LinkUI): void {
    const contentUriPath: string | null = extractContentUriPath(dragEvent);
    if (contentUriPath) {
      DragDropAsyncSupport.resetIsLinkableMap();
    }
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

  static #setDataAndSwitchToExternalLink(linkUI: LinkUI, data: string): void {
    linkUI.formView.urlInputView.fieldView.set("value", data);
    linkUI.formView.set("contentUriPath", null);
    linkUI.actionsView.set("contentUriPath", null);
    showContentLinkField(linkUI.formView, false);
    showContentLinkField(linkUI.actionsView, false);
  }

  static #setDataAndSwitchToContentLink(linkUI: LinkUI, data: string): void {
    linkUI.formView.urlInputView.fieldView.set("value", null);
    linkUI.formView.set("contentUriPath", data);
    linkUI.actionsView.set("contentUriPath", data);
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
    const logger = ContentLinkFormViewExtension.#logger;
    if (!contentUriPath) {
      logger.debug(
        "DragOverEvent: No uri received from DragDropService, assume that is any text (like an url) and allow it"
      );
      dragEvent.dataTransfer.dropEffect = "copy";
      return;
    }

    logger.debug("DragOverEvent: Received uri path from DragDropService: " + contentUriPath);
    const isLinkable = DragDropAsyncSupport.isLinkable(contentUriPath);
    logger.debug("DragOverEvent: Content is linkable: " + isLinkable);
    dragEvent.dataTransfer.dropEffect = isLinkable ? "copy" : "none";
  }
}

export default ContentLinkFormViewExtension;
