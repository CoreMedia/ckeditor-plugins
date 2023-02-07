import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import ContentLinkActionsViewExtension from "./ui/ContentLinkActionsViewExtension";
import ContentLinkFormViewExtension from "./ui/ContentLinkFormViewExtension";
import ContentLinkCommandHook from "./ContentLinkCommandHook";
import Link from "@ckeditor/ckeditor5-link/src/link";
import { Emitter } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import LinkCommand from "@ckeditor/ckeditor5-link/src/linkcommand";
import { addClassToTemplate, createDecoratorHook } from "../utils";
import { CONTENT_CKE_MODEL_URI_REGEXP } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import LinkActionsView from "@ckeditor/ckeditor5-link/src/ui/linkactionsview";
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import "../lang/contentlink";
import ContentLinkClipboardPlugin from "./ContentLinkClipboardPlugin";
import { OpenInTabCommand } from "@coremedia/ckeditor5-coremedia-content/commands/OpenInTabCommand";
import LinkUserActionsPlugin from "./LinkUserActionsPlugin";
import { addMouseEventListenerToHideDialog, removeInitialMouseDownListener } from "./LinkBalloonEventListenerFix";

/**
 * This plugin allows content objects to be dropped into the link dialog.
 * Content Links will be displayed as a content item.
 */
export default class ContentLinks extends Plugin {
  static readonly pluginName: string = "ContentLinks";

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
    removeInitialMouseDownListener(linkUI);
    addMouseEventListenerToHideDialog(linkUI);
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
