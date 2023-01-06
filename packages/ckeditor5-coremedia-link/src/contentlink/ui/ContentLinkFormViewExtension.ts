/* eslint no-null/no-null: off */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import createContentLinkView from "./ContentLinkViewFactory";
import {
  CONTENT_CKE_MODEL_URI_REGEXP,
  requireContentCkeModelUri,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
import { showContentLinkField } from "../ContentLinkViewUtils";
import ContentLinkCommandHook from "../ContentLinkCommandHook";
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import Command from "@ckeditor/ckeditor5-core/src/command";
import { hasContentUriPathAndName } from "./ViewExtensions";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import { getEvaluationResult, isLinkable, IsLinkableEvaluationResult } from "./IsLinkableDragAndDrop";
import { URI_LIST_DATA } from "@coremedia/ckeditor5-coremedia-studio-integration/content/Constants";
import { serviceAgent } from "@coremedia/service-agent";
import { createContentImportServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/ContentImportService";
import { createContentReferenceServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/IContentReferenceService";

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

  static readonly requires = [LinkUI, ContentLinkCommandHook];

  init(): Promise<void> | void {
    const initInformation = reportInitStart(this);

    const editor = this.editor;
    const linkUI: LinkUI = editor.plugins.get(LinkUI);
    const { formView } = linkUI;
    const contentLinkCommandHook: ContentLinkCommandHook = editor.plugins.get(ContentLinkCommandHook);
    const linkCommand = editor.commands.get("link") as Command;

    formView.set({
      contentUriPath: undefined,
      contentName: undefined,
    });

    formView
      .bind("contentUriPath")
      .to(linkCommand, "value", (value: unknown) =>
        typeof value === "string" && CONTENT_CKE_MODEL_URI_REGEXP.test(value) ? value : undefined
      );

    this.#rebindSaveEnabled(linkCommand, formView);

    // We need to propagate the content name prior to the LinkCommand being executed.
    // This is required for collapsed selections, where the LinkCommand wants to
    // write the URL into the text. For content-links this must be the content name
    // instead.
    this.listenTo(
      formView,
      "submit",
      () => {
        if (hasContentUriPathAndName(formView)) {
          const { contentUriPath, contentName } = formView;
          if (contentUriPath) {
            contentLinkCommandHook.registerContentName(contentUriPath, contentName);
          }
        }
      },
      {
        // We need to register the content name prior to the LinkCommand being executed.
        priority: "high",
      }
    );

    this.#extendView(linkUI);

    reportInitEnd(initInformation);
  }

  /**
   * When in Content-Link mode, we need to respect additional states to decide on
   * enabled/disabled state of Save-Button. Which is: We must only activate the
   * save-button when we know the content-name to write for collapsed selections.
   *
   * @param linkCommand - command, which is originally bound to enabled state
   * @param formView - formView to rebind enabled state of saveButtonView for
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
    ): boolean =>
      // Either contentUriPath must be unset or contentName must be set.
      isEnabled && (!contentUriPath || !!contentName);
    saveButtonView.unbind("isEnabled");
    // @ts-expect-error TODO Fix after Migrating to Types from DefinitelyTyped
    saveButtonView.bind("isEnabled").to(...enabledProperties, enabledHandler);
  }

  #extendView(linkUI: LinkUI): void {
    const { formView } = linkUI;
    const contentLinkView = createContentLinkView(this.editor.locale, linkUI);

    formView.once("render", () => ContentLinkFormViewExtension.#render(contentLinkView, linkUI));
    formView.on("cancel", () => {
      const initialValue: string = this.editor.commands.get("link")?.value as string;
      formView.set({
        contentUriPath: CONTENT_CKE_MODEL_URI_REGEXP.test(initialValue) ? initialValue : null,
      });
    });
  }

  static #render(contentLinkView: LabeledFieldView, linkUI: LinkUI): void {
    const logger = ContentLinkFormViewExtension.#logger;
    const { formView } = linkUI;

    logger.debug("Rendering ContentLinkView and registering listeners.");
    formView.registerChild(contentLinkView);

    if (!contentLinkView.isRendered) {
      logger.debug(`ContentLinkView not rendered yet. Triggering render().`);
      contentLinkView.render();
    }

    // @ts-expect-error TODO We must check for null/undefined here.
    formView.element.insertBefore(contentLinkView.element, formView.urlInputView.element.nextSibling);
    ContentLinkFormViewExtension.#addDragAndDropListeners(contentLinkView, linkUI);
  }

  static #addDragAndDropListeners(contentLinkView: LabeledFieldView, linkUI: LinkUI): void {
    const logger = ContentLinkFormViewExtension.#logger;
    const { formView } = linkUI;

    logger.debug("Adding drag and drop listeners to formView and contentLinkView");
    // @ts-expect-error TODO We must check for null/undefined here.
    contentLinkView.fieldView.element.addEventListener("drop", (dragEvent: DragEvent) => {
      ContentLinkFormViewExtension.#onDropOnLinkField(dragEvent, linkUI);
    });
    // @ts-expect-error TODO We must check for null/undefined here.
    contentLinkView.fieldView.element.addEventListener("dragover", ContentLinkFormViewExtension.#onDragOverLinkField);

    // @ts-expect-error TODO We must check for null/undefined here.
    formView.urlInputView.fieldView.element.addEventListener("drop", (dragEvent: DragEvent) => {
      ContentLinkFormViewExtension.#onDropOnLinkField(dragEvent, linkUI);
    });
    // @ts-expect-error TODO We must check for null/undefined here.
    formView.urlInputView.fieldView.element.addEventListener(
      "dragover",
      ContentLinkFormViewExtension.#onDragOverLinkField
    );
    logger.debug("Finished adding drag and drop listeners.");
  }

  static #onDropOnLinkField(dragEvent: DragEvent, linkUI: LinkUI): void {
    const logger = ContentLinkFormViewExtension.#logger;

    const contentBeanReferences: string | undefined = dragEvent.dataTransfer?.getData(URI_LIST_DATA);

    if (!contentBeanReferences) {
      const data: string | undefined = dragEvent.dataTransfer?.getData("text/plain");
      if (data) {
        dragEvent.preventDefault();
        ContentLinkFormViewExtension.#setDataAndSwitchToExternalLink(linkUI, data);
      }
      return;
    }

    dragEvent.preventDefault();
    ContentLinkFormViewExtension.#toggleUrlInputLoadingState(linkUI, true);

    const linkable = getEvaluationResult(contentBeanReferences);
    if (!linkable || linkable === "PENDING") {
      return;
    }

    const contentUris = linkable.uris;
    if (!contentUris) {
      ContentLinkFormViewExtension.#toggleUrlInputLoadingState(linkUI, false);
      return;
    }

    const uri: string | undefined = contentUris[0];
    if (!uri) {
      logger.warn("Invalid amount of uris dropped.");
      ContentLinkFormViewExtension.#toggleUrlInputLoadingState(linkUI, false);
      return;
    }

    ContentLinkFormViewExtension.#toContentUri(uri)
      .then((importedUri: string) => {
        const ckeModelUri = requireContentCkeModelUri(importedUri);
        ContentLinkFormViewExtension.#toggleUrlInputLoadingState(linkUI, false);
        ContentLinkFormViewExtension.#setDataAndSwitchToContentLink(linkUI, ckeModelUri);
      })
      .catch((reason) => {
        logger.warn(reason);
      });
  }

  static async #toContentUri(uri: string): Promise<string> {
    const contentReferenceService = await serviceAgent.fetchService(createContentReferenceServiceDescriptor());
    const contentReference = await contentReferenceService.getContentReference(uri);

    if (contentReference.contentUri) {
      //The reference uri is a content uri
      return contentReference.contentUri;
    }

    if (!contentReference.externalUriInformation) {
      return Promise.reject("No content found and uri is not importable.");
    }

    if (contentReference.externalUriInformation.contentUri) {
      //The external content has been imported previously. A content representation already exists.
      return contentReference.externalUriInformation.contentUri;
    }

    //Neither a content nor a content representation found. Let's create a content representation.
    const contentImportService = await serviceAgent.fetchService(createContentImportServiceDescriptor());
    return contentImportService.import(contentReference.request);
  }

  static #toggleUrlInputLoadingState(linkUI: LinkUI, loading: boolean) {
    const view = linkUI.formView;
    if (loading) {
      view.element?.classList.add("cm-ck-form-view--loading");
    } else {
      view.element?.classList.remove("cm-ck-form-view--loading");
    }
  }

  static #setDataAndSwitchToExternalLink(linkUI: LinkUI, data: string): void {
    const { formView } = linkUI;
    formView.urlInputView.fieldView.set("value", data);
    formView.set("contentUriPath", null);
    linkUI.actionsView.set("contentUriPath", null);
    showContentLinkField(formView, false);
    showContentLinkField(linkUI.actionsView, false);
  }

  static #setDataAndSwitchToContentLink(linkUI: LinkUI, data: string): void {
    const { formView } = linkUI;
    // element.offsetParent is null if the balloon is not visible.
    // If a user closes the balloon before this method gets called could open
    // with a wrong state.
    if (!formView.element?.offsetParent) {
      return;
    }
    formView.urlInputView.fieldView.set("value", null);
    formView.set("contentUriPath", data);
    linkUI.actionsView.set("contentUriPath", data);
    showContentLinkField(formView, true);
    showContentLinkField(linkUI.actionsView, true);
  }

  /**
   * On dragover we have to decide if a drop is allowed here or not.
   * A drop must be allowed if it is any URL (for external links) or if it is a content, which is allowed to drop.
   * A content is allowed to drop if the DragDropService has any data and if the given content from DragDropService is
   * a CMLinkable.
   *
   * @param dragEvent - the drag event.
   */
  static #onDragOverLinkField(dragEvent: DragEvent): void {
    dragEvent.preventDefault();
    if (!dragEvent.dataTransfer) {
      return;
    }

    const logger = ContentLinkFormViewExtension.#logger;
    const isLinkableEvaluationResult: IsLinkableEvaluationResult | undefined = isLinkable();

    if (!isLinkableEvaluationResult) {
      logger.debug(
        "DragOverEvent: No URI received from DragDropService. Assuming that is any text (like an url) and allow it."
      );
      dragEvent.dataTransfer.dropEffect = "copy";
      return;
    }

    if (isLinkableEvaluationResult === "PENDING") {
      dragEvent.dataTransfer.dropEffect = "none";
      return;
    }

    if (isLinkableEvaluationResult.uris?.length !== 1) {
      logger.debug(
        `DragOverEvent: Received ${isLinkableEvaluationResult.uris?.length} URI-paths, while it is not allowed to drop multiple contents.`
      );
      dragEvent.dataTransfer.dropEffect = "none";
      return;
    }

    dragEvent.dataTransfer.dropEffect = isLinkableEvaluationResult.isLinkable ? "link" : "none";
  }
}

export default ContentLinkFormViewExtension;
