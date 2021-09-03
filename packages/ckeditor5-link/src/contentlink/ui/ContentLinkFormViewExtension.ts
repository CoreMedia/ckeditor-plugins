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
  extractContentUriPaths,
  receiveUriPathsFromDragDropService,
} from "@coremedia/coremedia-studio-integration/content/DragAndDropUtils";
import { showContentLinkField } from "../ContentLinkViewUtils";
import ContentLinkView from "./ContentLinkView";
import DragDropAsyncSupport from "@coremedia/coremedia-studio-integration/content/DragDropAsyncSupport";
import ContentLinkCommandHook from "../ContentLinkCommandHook";
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import Command from "@ckeditor/ckeditor5-core/src/command";
import ContentLinkFormViewPropertyAccessor from "./ContentLinkFormViewPropertyAccessor";

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
    return [LinkUI, ContentLinkCommandHook];
  }

  init(): Promise<void> | null {
    const logger = ContentLinkFormViewExtension.#logger;
    const startTimestamp = performance.now();

    logger.debug(`Initializing ${ContentLinkFormViewExtension.pluginName}...`);

    const editor = this.editor;
    const linkUI: LinkUI = <LinkUI>editor.plugins.get(LinkUI);
    const formView = linkUI.formView;
    const contentLinkCommandHook: ContentLinkCommandHook = <ContentLinkCommandHook>(
      editor.plugins.get(ContentLinkCommandHook)
    );
    const linkCommand = <Command>editor.commands.get("link");

    formView.set({
      contentUriPath: undefined,
      contentName: undefined,
    });

    formView.bind("contentUriPath").to(linkCommand, "value", (value: string) => {
      return CONTENT_CKE_MODEL_URI_REGEXP.test(value) ? value : undefined;
    });

    this.#rebindSaveEnabled(linkCommand, formView);

    // We need to propagate the content name prior to the LinkCommand being executed.
    // This is required for collapsed selections, where the LinkCommand wants to
    // write the URL into the text. For content-links this must be the content name
    // instead.
    this.listenTo(
      formView,
      "submit",
      () => {
        const contentLinksProperties = formView as ContentLinkFormViewPropertyAccessor;
        if (!!contentLinksProperties.contentUriPath && typeof contentLinksProperties.contentName === "string") {
          contentLinkCommandHook.registerContentName(
            contentLinksProperties.contentUriPath,
            contentLinksProperties.contentName
          );
        }
      },
      {
        // We need to register the content name prior to the LinkCommand being executed.
        priority: "high",
      }
    );

    this.#extendView(linkUI);

    logger.debug(
      `Initialized ${ContentLinkFormViewExtension.pluginName} within ${performance.now() - startTimestamp} ms.`
    );

    return null;
  }

  /**
   * When in Content-Link mode, we need to respect additional states to decide on
   * enabled/disabled state of Save-Button. Which is: We must only activate the
   * save-button when we know the content-name to write for collapsed selections.
   *
   * @param linkCommand command which is originally bound to enabled state
   * @param formView formView to rebind enabled state of saveButtonView for
   * @private
   */
  #rebindSaveEnabled(linkCommand: Command, formView: LinkFormView): void {
    // We have to extend the algorithm of LinkUI to calculate the enabled state of
    // the save button. This is because, we must not submit a content-link when
    // we don't know its name yet.
    const saveButtonView = formView.saveButtonView;
    const enabledProperties = [linkCommand, "isEnabled", formView, "contentName", formView, "contentUriPath"];
    const enabledHandler = (
      isEnabled: boolean,
      contentName: string | undefined,
      contentUriPath: string | undefined
    ): boolean => {
      // Either contentUriPath must be unset or contentName must be set.
      return isEnabled && (!contentUriPath || !!contentName);
    };

    saveButtonView.unbind("isEnabled");
    saveButtonView.bind("isEnabled").to(...enabledProperties, enabledHandler);
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
    const contentUriPaths: Array<string> | null = extractContentUriPaths(dragEvent);
    if (contentUriPaths) {
      DragDropAsyncSupport.resetCache();
    }
    const contentCkeModelUris = extractContentCkeModelUri(dragEvent);
    dragEvent.preventDefault();

    //handle content links
    if (contentCkeModelUris !== null && contentCkeModelUris.length > 0) {
      if (contentCkeModelUris.length !== 1) {
        this.#logger.warn(
          "Received multiple contents on drop. Should not happen as the drag over should prevent drop of multiple contents."
        );
        return;
      }
      ContentLinkFormViewExtension.#setDataAndSwitchToContentLink(linkUI, contentCkeModelUris[0]);
      return;
    }

    //handle normal links
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

    const logger = ContentLinkFormViewExtension.#logger;
    const contentUriPaths: Array<string> | null = receiveUriPathsFromDragDropService();

    if (!contentUriPaths) {
      logger.debug(
        "DragOverEvent: No URI received from DragDropService. Assuming that is any text (like an url) and allow it."
      );
      dragEvent.dataTransfer.dropEffect = "copy";
      return;
    }

    if (contentUriPaths.length !== 1) {
      logger.debug(
        `DragOverEvent: Received ${contentUriPaths.length} URI-paths, while it is not allowed to drop multiple contents.`
      );
      dragEvent.dataTransfer.dropEffect = "none";
      return;
    }

    const contentUriPath = contentUriPaths[0];
    const isLinkable = DragDropAsyncSupport.isLinkable(contentUriPath);

    logger.debug("DragOverEvent: Received Content URI-Path from DragDropService.", {
      uriPath: contentUriPath,
      linkable: isLinkable,
    });

    dragEvent.dataTransfer.dropEffect = isLinkable ? "copy" : "none";
  }
}

export default ContentLinkFormViewExtension;
