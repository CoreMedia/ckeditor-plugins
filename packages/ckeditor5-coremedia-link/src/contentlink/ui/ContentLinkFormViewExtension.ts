/* eslint no-null/no-null: off */

import { Plugin, Command } from "@ckeditor/ckeditor5-core";
import { LinkUI } from "@ckeditor/ckeditor5-link";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import createContentLinkView from "./ContentLinkViewFactory";
import {
  CONTENT_CKE_MODEL_URI_REGEXP,
  requireContentCkeModelUri,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { LabeledFieldView, View, ContextualBalloon } from "@ckeditor/ckeditor5-ui";
import { showContentLinkField } from "../ContentLinkViewUtils";
import ContentLinkCommandHook from "../ContentLinkCommandHook";
// LinkFormView: See ckeditor/ckeditor5#12027.
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import { hasContentUriPath, hasContentUriPathAndName } from "./ViewExtensions";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import { serviceAgent } from "@coremedia/service-agent";
import { createContentImportServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/ContentImportService";
import { createContentReferenceServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/IContentReferenceService";
import { receiveDraggedItemsFromDataTransfer } from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/DragDropServiceWrapper";
import {
  getEvaluationResult,
  isLinkable,
  IsLinkableEvaluationResult,
} from "@coremedia/ckeditor5-coremedia-studio-integration/content/IsLinkableDragAndDrop";
import { handleFocusManagement } from "@coremedia/ckeditor5-link-common/FocusUtils";
import ContentLinkView from "./ContentLinkView";
import { addClassToTemplate } from "../../utils";
import { LazyLinkUIPropertiesNotInitializedYetError } from "../LazyLinkUIPropertiesNotInitializedYetError";

/**
 * We add `contentUriPath` and `contentName` to the form view.
 */
interface AugmentedFormView {
  contentUriPath?: string;
  contentName?: string;
}

/**
 * Provides augmented typing for form view.
 *
 * @param formView - formView to augment
 */
const augmentFormView = <T extends object>(formView: T): T & AugmentedFormView => formView;

/**
 * Extends the form view for Content link display. This includes:
 *
 * * render name of linked content (or placeholder for unreadable content)
 * * allow dropping of drag items into the URL field
 * * to provide `onClick` handler to open a content in a new Studio tab
 */
class ContentLinkFormViewExtension extends Plugin {
  public static readonly pluginName = "ContentLinkFormViewExtension" as const;
  static readonly #logger: Logger = LoggerProvider.getLogger(ContentLinkFormViewExtension.pluginName);

  static readonly #CM_LINK_FORM_CLS = "cm-ck-link-form";
  static readonly #CM_FORM_VIEW_CLS = "cm-ck-link-form-view";

  static readonly requires = [LinkUI, ContentLinkCommandHook];

  #initialized = false;

  #contentLinkView: LabeledFieldView | undefined = undefined;

  init(): Promise<void> | void {
    const initInformation = reportInitStart(this);

    const editor = this.editor;
    const linkUI: LinkUI = editor.plugins.get(LinkUI);
    const contextualBalloon: ContextualBalloon = editor.plugins.get(ContextualBalloon);
    contextualBalloon.on("change:visibleView", (evt, name, visibleView) => {
      if (visibleView && visibleView === linkUI.formView && !this.#initialized) {
        this.initializeFormView(linkUI);
        this.#initialized = true;
      }
    });

    contextualBalloon.on("change:visibleView", (evt, name, visibleView) => {
      if (visibleView && visibleView === linkUI.formView) {
        this.onFormViewGetsActive(linkUI);
      }
    });

    reportInitEnd(initInformation);
  }

  initializeFormView(linkUI: LinkUI): void {
    const { formView } = linkUI;

    const linkCommand = linkUI.editor.commands.get("link") as Command;
    if (!formView) {
      throw new LazyLinkUIPropertiesNotInitializedYetError();
    }

    const augmentedFormView = augmentFormView(formView);

    augmentedFormView.set({
      contentUriPath: undefined,
      contentName: undefined,
    });

    augmentedFormView
      .bind("contentUriPath")
      .to(linkCommand, "value", (value: unknown) =>
        typeof value === "string" && CONTENT_CKE_MODEL_URI_REGEXP.test(value) ? value : undefined
      );

    this.#extendView(linkUI);
  }

  onFormViewGetsActive(linkUI: LinkUI): void {
    const { editor } = linkUI;
    const { formView } = linkUI;
    const contentLinkCommandHook: ContentLinkCommandHook = editor.plugins.get(ContentLinkCommandHook);
    const linkCommand = editor.commands.get("link") as Command;

    if (!formView) {
      throw new LazyLinkUIPropertiesNotInitializedYetError();
    }
    formView.on("change:contentUriPath", (evt) => {
      const { source } = evt;
      const { formView } = linkUI;
      if (!formView) {
        throw new LazyLinkUIPropertiesNotInitializedYetError();
      }

      if (!hasContentUriPath(source)) {
        // set visibility of url and content field
        showContentLinkField(formView, false);
        return;
      }

      const { contentUriPath: value } = source;

      // content link value has changed. set urlInputView accordingly
      // value is null if it was set by cancelling and reopening the dialog, resetting the dialog should not
      // re-trigger a set of utlInputView here
      if (value !== null) {
        formView.urlInputView.fieldView.set({
          value: value ?? "",
        });
      }

      // set visibility of url and content field
      showContentLinkField(formView, !!value);

      // focus contentLinkView when formView is opened and urlInputView is not visible
      this.#focusContentLinkViewIfVisible(formView);
    });
    this.#rebindSaveEnabled(linkCommand, formView);

    // If the form view has a content uri path, add the behavior to show the content view.
    if (hasContentUriPath(formView)) {
      formView.element?.classList.add(ContentLinkFormViewExtension.#CM_FORM_VIEW_CLS);
      formView.element?.classList.add(ContentLinkFormViewExtension.#CM_LINK_FORM_CLS);
      const value = formView.contentUriPath;
      showContentLinkField(formView, !!value);
    }

    // focus contentLinkView when formView is opened and urlInputView is not visible
    this.#focusContentLinkViewIfVisible(formView);

    // We need to propagate the content name prior to the LinkCommand being executed.
    // This is required for collapsed selections, where the LinkCommand wants to
    // write the URL into the text. For content-links, this must be the content name
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
        // We need to register the content's name prior to the LinkCommand being executed.
        priority: "high",
      }
    );
  }

  /**
   * Focus the ContentLinkView if the UrlInputView is hidden.
   *
   * @param formView - the formView
   * @private
   */
  #focusContentLinkViewIfVisible(formView: LinkFormView): void {
    if (!formView.urlInputView.element || formView.urlInputView.element.style.visibility === "") {
      // the urlInput is hidden, focus contentView instead
      if (this.#contentLinkView) {
        this.#contentLinkView.focus();
      }
    }
  }

  /**
   * When in Content-Link mode, we need to respect additional states to decide on
   * enabled/disabled state of Save-Button. Which is: We must only activate the
   * save-button when we know the content-name to write for collapsed selections.
   *
   * @param linkCommand - command, which is originally bound to the enabled state
   * @param formView - formView to rebind enabled state of saveButtonView for
   */
  #rebindSaveEnabled(linkCommand: Command, formView: LinkFormView): void {
    // We have to extend the algorithm of LinkUI to calculate the enabled state of
    // the save button. This is because we must not submit a content-link when
    // we don't know its name yet.
    const saveButtonView = formView.saveButtonView;
    const augmentedFormView = augmentFormView(formView);
    const enabledHandler = (
      isEnabled: boolean,
      contentName: string | undefined,
      contentUriPath: string | undefined
    ): boolean =>
      // Either contentUriPath must be unset or contentName must be set.
      isEnabled && (!contentUriPath || !!contentName);
    saveButtonView.unbind("isEnabled");
    saveButtonView
      .bind("isEnabled")
      .to(
        linkCommand,
        "isEnabled",
        augmentedFormView,
        "contentName",
        augmentedFormView,
        "contentUriPath",
        enabledHandler
      );
  }

  #extendView(linkUI: LinkUI): void {
    const { formView } = linkUI;
    if (!formView) {
      throw new LazyLinkUIPropertiesNotInitializedYetError();
    }
    const contentLinkView = createContentLinkView(linkUI, this.editor);
    this.#contentLinkView = contentLinkView;

    contentLinkView.on("change:contentName", () => {
      if (!this.editor.isReadOnly) {
        const contextualBalloon: ContextualBalloon = this.editor.plugins.get(ContextualBalloon);
        if (contextualBalloon.visibleView && contextualBalloon.visibleView === linkUI.formView) {
          contextualBalloon.updatePosition();
        }
      }
    });

    ContentLinkFormViewExtension.#render(contentLinkView, linkUI);
    this.#adaptFormViewFields(linkUI);
    formView.on("cancel", () => {
      const initialValue: string = this.editor.commands.get("link")?.value as string;
      formView.set({
        // @ts-expect-errors since 37.0.0, how to extend the view with another property?
        contentUriPath: CONTENT_CKE_MODEL_URI_REGEXP.test(initialValue) ? initialValue : null,
      });
    });
  }

  static #render(contentLinkView: LabeledFieldView, linkUI: LinkUI): void {
    const logger = ContentLinkFormViewExtension.#logger;
    const { formView } = linkUI;
    if (!formView) {
      throw new LazyLinkUIPropertiesNotInitializedYetError();
    }
    logger.debug("Rendering ContentLinkView and registering listeners.");
    formView.registerChild(contentLinkView);

    if (!contentLinkView.isRendered) {
      logger.debug(`ContentLinkView not rendered yet. Triggering render().`);
      contentLinkView.render();
    }

    const {
      element: formViewElement,
      urlInputView: { element: urlInputViewElement },
    } = formView;
    const { element: contentLinkViewElement } = contentLinkView;

    if (!formViewElement || !contentLinkViewElement || !urlInputViewElement) {
      logger.debug("Unexpected state on render: Required elements are missing", {
        formViewElement,
        contentLinkViewElement,
        urlInputViewElement,
      });
      throw new Error("Unexpected state on render: Required elements are missing.");
    }

    formViewElement.insertBefore(contentLinkViewElement, urlInputViewElement.nextSibling);

    const contentLinkButtons = ContentLinkFormViewExtension.#getContentLinkButtons(contentLinkView);
    handleFocusManagement(formView, contentLinkButtons, formView.urlInputView);

    ContentLinkFormViewExtension.#addDragAndDropListeners(contentLinkView, linkUI);
  }

  #adaptFormViewFields(linkUI: LinkUI): void {
    const { formView } = linkUI;
    if (!formView) {
      throw new LazyLinkUIPropertiesNotInitializedYetError();
    }
    const t = this.editor.locale.t;
    formView.urlInputView.set({
      label: t("Link"),
      class: ["cm-ck-external-link-field"],
    });
    formView.urlInputView.fieldView.set({
      placeholder: t("Enter url or drag and drop content onto this area."),
    });

    if (!formView.element) {
      ContentLinkFormViewExtension.#logger.error("FormView must be rendered to provide classes");
    }
    addClassToTemplate(formView, ContentLinkFormViewExtension.#CM_LINK_FORM_CLS);
    addClassToTemplate(formView, ContentLinkFormViewExtension.#CM_FORM_VIEW_CLS);
  }

  /**
   * Returns the contentLinkView and the focusable "cancel link" button.
   *
   * @param contentLinkView - the contentLinkView
   * @returns both buttons
   * @private
   */
  static #getContentLinkButtons(contentLinkView: LabeledFieldView): View[] {
    const contentView = contentLinkView.fieldView as unknown as ContentLinkView;
    const buttons: View[] = [contentLinkView];
    if (contentView.cancelButton) {
      buttons.push(contentView.cancelButton);
    }
    return buttons;
  }

  static #addDragAndDropListeners(contentLinkView: LabeledFieldView, linkUI: LinkUI): void {
    const logger = ContentLinkFormViewExtension.#logger;
    const { formView } = linkUI;
    if (!formView) {
      throw new LazyLinkUIPropertiesNotInitializedYetError();
    }
    logger.debug("Adding drag and drop listeners to formView and contentLinkView");

    if (!contentLinkView.fieldView.element) {
      logger.warn("ContentLinkView not completely rendered. Drag and drop won't work.", contentLinkView);
    }

    contentLinkView.fieldView.element?.addEventListener("drop", (dragEvent: DragEvent) => {
      ContentLinkFormViewExtension.#onDropOnLinkField(dragEvent, linkUI);
    });
    contentLinkView.fieldView.element?.addEventListener("dragover", ContentLinkFormViewExtension.#onDragOverLinkField);

    if (!formView.urlInputView.fieldView.element) {
      logger.warn("FormView.urlInputView not completely rendered. Drag and drop won't work.", formView);
    }
    formView.urlInputView.fieldView.element?.addEventListener("drop", (dragEvent: DragEvent) => {
      ContentLinkFormViewExtension.#onDropOnLinkField(dragEvent, linkUI);
    });
    formView.urlInputView.fieldView.element?.addEventListener(
      "dragover",
      ContentLinkFormViewExtension.#onDragOverLinkField
    );
    logger.debug("Finished adding drag and drop listeners.");
  }

  static #onDropOnLinkField(dragEvent: DragEvent, linkUI: LinkUI): void {
    const logger = ContentLinkFormViewExtension.#logger;
    if (!dragEvent.dataTransfer) {
      return;
    }
    const uris = receiveDraggedItemsFromDataTransfer(dragEvent.dataTransfer);

    if (!uris) {
      const data: string | undefined = dragEvent.dataTransfer?.getData("text/plain");
      if (data) {
        dragEvent.preventDefault();
        ContentLinkFormViewExtension.#setDataAndSwitchToExternalLink(linkUI, data);
      }
      return;
    }

    dragEvent.preventDefault();
    ContentLinkFormViewExtension.#toggleUrlInputLoadingState(linkUI, true);

    const linkable = getEvaluationResult(uris);
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
    const { formView } = linkUI;
    if (!formView) {
      throw new LazyLinkUIPropertiesNotInitializedYetError();
    }

    if (loading) {
      formView.element?.classList.add("cm-ck-form-view--loading");
    } else {
      formView.element?.classList.remove("cm-ck-form-view--loading");
    }
  }

  static #setDataAndSwitchToExternalLink(linkUI: LinkUI, data: string): void {
    const { formView, actionsView } = linkUI;
    if (!formView || !actionsView) {
      throw new LazyLinkUIPropertiesNotInitializedYetError();
    }
    formView.urlInputView.fieldView.set("value", data);
    // @ts-expect-errors since 37.0.0, how to extend the view with another property?
    formView.set("contentUriPath", null);
    // @ts-expect-errors since 37.0.0, how to extend the view with another property?
    actionsView.set("contentUriPath", null);
    showContentLinkField(formView, false);
    showContentLinkField(actionsView, false);
  }

  static #setDataAndSwitchToContentLink(linkUI: LinkUI, data: string): void {
    const { formView, actionsView } = linkUI;
    if (!formView || !actionsView) {
      throw new LazyLinkUIPropertiesNotInitializedYetError();
    }
    // Check if the balloon is visible. If it was closed, while data was loaded, just return.
    // We can use element.offsetParent to check if the balloon's HTML element is visible.
    if (!formView.element?.offsetParent) {
      return;
    }
    formView.urlInputView.fieldView.set("value", undefined);
    // @ts-expect-errors since 37.0.0, how to extend the view with another property?
    formView.set("contentUriPath", data);
    // @ts-expect-errors since 37.0.0, how to extend the view with another property?
    actionsView.set("contentUriPath", data);
    showContentLinkField(formView, true);
    showContentLinkField(actionsView, true);
  }

  /**
   * On dragover we have to decide if a drop is allowed here or not.
   * A drop must be allowed if it is any URL (for external links) or if it is a content, which is allowed to drop.
   * A content is allowed to drop if the DragDropService has any data, and if the given content from DragDropService is
   * a `CMLinkable`.
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
