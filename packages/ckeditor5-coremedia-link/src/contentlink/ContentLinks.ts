import { Plugin, Editor } from "@ckeditor/ckeditor5-core";
import { LinkUI, Link, LinkCommand } from "@ckeditor/ckeditor5-link";
import ContentLinkActionsViewExtension from "./ui/ContentLinkActionsViewExtension";
import ContentLinkFormViewExtension from "./ui/ContentLinkFormViewExtension";
import ContentLinkCommandHook from "./ContentLinkCommandHook";
import { createDecoratorHook } from "../utils";
import "../lang/contentlink";
import ContentLinkClipboardPlugin from "./ContentLinkClipboardPlugin";
import LinkUserActionsPlugin from "./LinkUserActionsPlugin";
import { ContextualBalloon } from "@ckeditor/ckeditor5-ui";
import { CONTENT_CKE_MODEL_URI_REGEXP } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/UriPath";
import { serviceAgent } from "@coremedia/service-agent";
import { addMouseEventListenerToHideDialog, removeInitialMouseDownListener } from "./LinkBalloonEventListenerFix";
import { createWorkAreaServiceDescriptor } from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/WorkAreaServiceDescriptor";
import { Subscription } from "rxjs";

import WorkAreaService from "@coremedia/ckeditor5-coremedia-studio-integration/src/content/studioservices/WorkAreaService";
import { closeContextualBalloon } from "./ContentLinkViewUtils";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import { parseLinkBalloonConfig } from "./LinkBalloonConfig";
import { hasRequiredInternalLinkUI } from "./InternalLinkUI";
import { Observable } from "@ckeditor/ckeditor5-utils";
import { asAugmentedLinkUI, requireNonNullsAugmentedLinkUI } from "./ui/AugmentedLinkUI";
import { openContentInTabCommandName, registerOpenContentInTabCommand } from "./OpenContentInTabCommand";

/**
 * This plugin allows content objects to be dropped into the link dialog.
 * Content Links will be displayed as a content item.
 */
export default class ContentLinks extends Plugin {
  public static readonly pluginName = "ContentLinks" as const;

  static readonly openLinkInTab = openContentInTabCommandName;

  readonly #logger = LoggerProvider.getLogger(ContentLinks.pluginName);
  #serviceRegisteredSubscription: Pick<Subscription, "unsubscribe"> | undefined = undefined;
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
   * Can be used to clear all activity in the editor when contextual
   * balloons are closed manually.
   *
   * @private
   */
  #removeEditorFocusAndSelection(): void {
    const linkUI: unknown = this.editor.plugins.get(LinkUI);
    if (hasRequiredInternalLinkUI(linkUI)) {
      linkUI._hideUI();
    }
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
        this.initializeLinkBalloonListeners(linkUI);
        this.#initialized = true;
      }
    });

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

    registerOpenContentInTabCommand(editor);
  }

  initializeLinkBalloonListeners(linkUI: LinkUI): void {
    const { editor } = linkUI;
    removeInitialMouseDownListener(linkUI);
    addMouseEventListenerToHideDialog(linkUI);
    parseLinkBalloonConfig(editor.config);
    const internalLinkUI: Observable = linkUI;

    if (hasRequiredInternalLinkUI(internalLinkUI)) {
      createDecoratorHook(internalLinkUI, "_hideUI", this.onHideUiCallback(editor), this);
    }
  }

  onHideUiCallback(editor: Editor): () => void {
    return () => {
      const linkCommand = editor.commands.get("link") as LinkCommand;
      const linkUI = asAugmentedLinkUI(editor.plugins.get(LinkUI));
      if (!linkUI || !linkCommand) {
        return;
      }
      const { formView, actionsView } = requireNonNullsAugmentedLinkUI(linkUI, "actionsView", "formView");

      const commandValue: string = linkCommand.value ?? "";
      const value = CONTENT_CKE_MODEL_URI_REGEXP.test(commandValue) ? commandValue : undefined;
      formView.set({ contentUriPath: value });
      actionsView.set({ contentUriPath: value });
    };
  }
}
