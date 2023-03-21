import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import ContentLinkActionsViewExtension from "./ui/ContentLinkActionsViewExtension";
import ContentLinkFormViewExtension from "./ui/ContentLinkFormViewExtension";
import ContentLinkCommandHook from "./ContentLinkCommandHook";
import Link from "@ckeditor/ckeditor5-link/src/link";
import { createDecoratorHook } from "../utils";
import "../lang/contentlink";
import ContentLinkClipboardPlugin from "./ContentLinkClipboardPlugin";
import LinkUserActionsPlugin from "./LinkUserActionsPlugin";
import ContextualBalloon from "@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon";
import { CONTENT_CKE_MODEL_URI_REGEXP } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { OpenInTabCommand } from "@coremedia/ckeditor5-coremedia-content/commands/OpenInTabCommand";
import LinkCommand from "@ckeditor/ckeditor5-link/src/linkcommand";
import { serviceAgent } from "@coremedia/service-agent";
import { addMouseEventListenerToHideDialog, removeInitialMouseDownListener } from "./LinkBalloonEventListenerFix";
import { createWorkAreaServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/content/WorkAreaServiceDescriptor";
import { Subscription } from "rxjs";

import WorkAreaService from "@coremedia/ckeditor5-coremedia-studio-integration/content/studioservices/WorkAreaService";
import { closeContextualBalloon } from "./ContentLinkViewUtils";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { parseLinkBalloonConfig } from "./LinkBalloonConfig";
import { Editor } from "@ckeditor/ckeditor5-core";
import { LazyLinkUIPropertiesNotInitializedYetError } from "./LazyLinkUIPropertiesNotInitializedYetError";

/**
 * This plugin allows content objects to be dropped into the link dialog.
 * Content Links will be displayed as a content item.
 */
export default class ContentLinks extends Plugin {
  static readonly pluginName: string = "ContentLinks";

  #logger = LoggerProvider.getLogger(ContentLinks.pluginName);
  #serviceRegisteredSubscription: Subscription | undefined = undefined;
  #initialized = false;

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
    const linkUI: LinkUI = editor.plugins.get(LinkUI);

    const contextualBalloon: ContextualBalloon = editor.plugins.get(ContextualBalloon);
    contextualBalloon.on("change:visibleView", (evt, name, visibleView) => {
      if (visibleView && visibleView === linkUI.actionsView && !this.#initialized) {
        this.onVisibleViewChanged(linkUI);
        this.#initialized = true;
      }
    });
  }

  onVisibleViewChanged(linkUI: LinkUI): void {
    const { editor } = linkUI;
    removeInitialMouseDownListener(linkUI);
    addMouseEventListenerToHideDialog(linkUI);
    parseLinkBalloonConfig(editor.config);

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

    createDecoratorHook(linkUI, "_hideUI", this.onHideUiCallback(editor), this);
    // registers the openInTab command for content links, used to open a content when clicking the content link
    editor.commands.add("openLinkInTab", new OpenInTabCommand(editor, "linkHref"));
  }

  onHideUiCallback(editor: Editor): () => void {
    return () => {
      const linkCommand = editor.commands.get("link") as LinkCommand;
      const linkUI: LinkUI = editor.plugins.get(LinkUI);
      if (!linkUI || !linkCommand) {
        return;
      }
      const { formView } = linkUI;
      const { actionsView } = linkUI;
      if (!formView || !actionsView) {
        throw new LazyLinkUIPropertiesNotInitializedYetError();
      }

      const commandValue: string = linkCommand.value ?? "";
      const value = CONTENT_CKE_MODEL_URI_REGEXP.test(commandValue) ? commandValue : undefined;
      // @ts-expect-errors since 37.0.0, how to extend the view with another property?
      formView.set({ contentUriPath: value });
      // @ts-expect-errors since 37.0.0, how to extend the view with another property?
      actionsView.set({ contentUriPath: value });
    };
  }
}
