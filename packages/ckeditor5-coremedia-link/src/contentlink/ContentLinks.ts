import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import ContentLinkActionsViewExtension from "./ui/ContentLinkActionsViewExtension";
import ContentLinkFormViewExtension from "./ui/ContentLinkFormViewExtension";
import ContentLinkCommandHook from "./ContentLinkCommandHook";
import Link from "@ckeditor/ckeditor5-link/src/link";
import LinkCommand from "@ckeditor/ckeditor5-link/src/linkcommand";
import { addClassToTemplate, createDecoratorHook } from "../utils";
import { CONTENT_CKE_MODEL_URI_REGEXP } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import LinkActionsView from "@ckeditor/ckeditor5-link/src/ui/linkactionsview";
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import "../lang/contentlink";
import ContentLinkClipboardPlugin from "./ContentLinkClipboardPlugin";
import { OpenInTabCommand } from "@coremedia/ckeditor5-coremedia-content/commands/OpenInTabCommand";
import LinkUserActionsPlugin from "./LinkUserActionsPlugin";
import { serviceAgent } from "@coremedia/service-agent";
import { addMouseEventListenerToHideDialog, removeInitialMouseDownListener } from "./LinkBalloonEventListenerFix";
import { createWorkAreaServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/WorkAreaServiceDescriptor";
import { Subscription } from "rxjs";

import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import WorkAreaService from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/WorkAreaService";
import { closeContextualBalloon } from "./ContentLinkViewUtils";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { parseLinkBalloonConfig } from "./LinkBalloonConfig";

/**
 * This plugin allows content objects to be dropped into the link dialog.
 * Content Links will be displayed as a content item.
 */
export default class ContentLinks extends Plugin {
  static readonly pluginName: string = "ContentLinks";

  #logger = LoggerProvider.getLogger(ContentLinks.pluginName);
  #serviceRegisteredSubscription: Subscription | undefined = undefined;

  /**
   * Closes the contextual balloon whenever a new active entity is set.
   *
   * @param workAreaService - the workAreaService
   * @private
   */
  #listenForActiveEntityChanges(workAreaService: WorkAreaService): void {
    workAreaService.observe_activeEntity().subscribe({
      next: (activeEntities) => {
        this.#logger.debug("Closing balloon because active entity changed", activeEntities);
        this.#removeEditorFocusAndSelection();
        closeContextualBalloon(this.editor);
      },
    });
  }

  /**
   * Removes the focus on the editor and clears the selection.
   * Can be used to clear all activity on the editor when contextual
   * balloons are closed manually.
   *
   * @private
   */
  #removeEditorFocusAndSelection(): void {
    const linkUI: LinkUI = this.editor.plugins.get(LinkUI);
    //@ts-expect-error private API
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    linkUI._hideUI();
  }

  static readonly requires = [
    Link,
    ContentLinkActionsViewExtension,
    ContentLinkFormViewExtension,
    ContentLinkCommandHook,
    ContentLinkClipboardPlugin,
    LinkUserActionsPlugin,
  ];

  init(): void {
    const editor = this.editor;
    const linkCommand = editor.commands.get("link") as LinkCommand;
    const linkUI: LinkUI = editor.plugins.get(LinkUI);
    parseLinkBalloonConfig(editor.config);
    removeInitialMouseDownListener(linkUI);
    addMouseEventListenerToHideDialog(linkUI);

    const onServiceRegisteredFunction = (services: WorkAreaService[]): void => {
      if (services.length === 0) {
        this.#logger.debug("No WorkAreaService registered yet");
        return;
      }
      if (this.#serviceRegisteredSubscription) {
        this.#serviceRegisteredSubscription.unsubscribe();
      }

      this.#logger.debug("WorkAreaService is registered now, listening for activeEntities will be started");
      const clipboardService = services[0];
      this.#listenForActiveEntityChanges(clipboardService);
    };

    this.#serviceRegisteredSubscription = serviceAgent
      .observeServices<WorkAreaService>(createWorkAreaServiceDescriptor())
      .subscribe(onServiceRegisteredFunction);

    this.#extendFormView(linkUI);
    ContentLinks.#extendActionsView(linkUI);
    createDecoratorHook(
      linkUI,
      "_hideUI",
      () => {
        const commandValue: string = linkCommand?.value ?? "";
        const value = CONTENT_CKE_MODEL_URI_REGEXP.test(commandValue) ? commandValue : undefined;
        const { formView } = linkUI;
        formView.set({ contentUriPath: value });
        linkUI.actionsView.set({ contentUriPath: value });
      },
      this
    );
    // registers the openInTab command for content links, used to open a content when clicking the content link
    editor.commands.add("openLinkInTab", new OpenInTabCommand(editor, "linkHref"));
  }

  #extendFormView(linkUI: LinkUI): void {
    const { formView } = linkUI;

    const t = this.editor.locale.t;
    formView.urlInputView.set({
      label: t("Link"),
      class: ["cm-ck-external-link-field"],
    });
    formView.urlInputView.fieldView.set({
      placeholder: t("Enter url or drag and drop content onto this area."),
    });

    ContentLinks.#customizeFormView(formView);
  }

  static #extendActionsView(linkUI: LinkUI): void {
    ContentLinks.#customizeActionsView(linkUI.actionsView);
  }

  static #customizeActionsView(actionsView: LinkActionsView): void {
    const CM_FORM_VIEW_CLS = "cm-ck-link-actions-view";
    const CM_PREVIEW_BUTTON_VIEW_CLS = "cm-ck-link-actions-preview";
    addClassToTemplate(actionsView, [CM_FORM_VIEW_CLS]);
    addClassToTemplate(actionsView.previewButtonView, [CM_PREVIEW_BUTTON_VIEW_CLS]);
  }

  static #customizeFormView(formView: LinkFormView): void {
    const CM_LINK_FORM_CLS = "cm-ck-link-form";
    const CM_FORM_VIEW_CLS = "cm-ck-link-form-view";
    addClassToTemplate(formView, [CM_LINK_FORM_CLS, CM_FORM_VIEW_CLS]);
  }
}
