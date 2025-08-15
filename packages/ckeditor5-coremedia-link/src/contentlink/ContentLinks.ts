import { createDecoratorHook } from "../utils";
import ContentLinkActionsViewExtension from "./ui/ContentLinkActionsViewExtension";
import ContentLinkFormViewExtension from "./ui/ContentLinkFormViewExtension";
import ContentLinkCommandHook from "./ContentLinkCommandHook";
import "../lang/contentlink";
import ContentLinkClipboardPlugin from "./ContentLinkClipboardPlugin";
import LinkUserActionsPlugin from "./LinkUserActionsPlugin";
import {
  CONTENT_CKE_MODEL_URI_REGEXP,
  createContentFormServiceDescriptor,
  ContentFormService,
} from "@coremedia/ckeditor5-coremedia-studio-integration";
import { serviceAgent } from "@coremedia/service-agent";
import { addMouseEventListenerToHideDialog, removeInitialMouseDownListener } from "./LinkBalloonEventListenerFix";
import { Subscription } from "rxjs";
import { closeContextualBalloon } from "./ContentLinkViewUtils";
import { LoggerProvider } from "@coremedia/ckeditor5-logging";
import { parseLinkBalloonConfig } from "./LinkBalloonConfig";
import { hasRequiredInternalLinkUI } from "./InternalLinkUI";
import { ContextualBalloon, Editor, Link, LinkCommand, LinkUI, Observable, Plugin } from "ckeditor5";
import { asAugmentedLinkUI, requireNonNullsAugmentedLinkUI } from "./ui/AugmentedLinkUI";
import { openContentInTabCommandName, registerOpenContentInTabCommand } from "./OpenContentInTabCommand";

/**
 * This plugin allows content objects to be dropped into the link dialog.
 * Content Links will be displayed as a content item.
 */
export default class ContentLinks extends Plugin {
  public static readonly pluginName = "ContentLinks" as const;
  static readonly openLinkInTab = openContentInTabCommandName;
  readonly #logger = LoggerProvider.getLogger("ContentLinks");
  #serviceRegisteredSubscription: Pick<Subscription, "unsubscribe"> | undefined = undefined;
  #initialized = false;
  #currentContentFormService: ContentFormService | undefined = undefined;
  #activeEntity: string | undefined = "";

  /**
   * Closes the contextual balloon whenever a new active entity is set.
   *
   * @param contentFormService - the contentFormService
   * @private
   */
  #listenForActiveEntityChanges(contentFormService: ContentFormService): void {
    contentFormService.observe_activeContent().subscribe({
      next: (activeEntity) => {
        if (this.#activeEntity === activeEntity) {
          return;
        }
        this.#logger.debug("Closing balloon because active entity changed", activeEntity);
        this.#removeEditorFocusAndSelection();
        closeContextualBalloon(this.editor);
        this.#activeEntity = typeof activeEntity === "string" ? activeEntity : undefined;
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
      if (visibleView && visibleView === linkUI.toolbarView && !this.#initialized) {
        this.initializeLinkBalloonListeners(linkUI);
        this.#initialized = true;
      }
    });
    const onServiceRegisteredFunction = (services: ContentFormService[]): void => {
      if (services.length === 0) {
        this.#logger.debug("No ContentFormService registered yet");
        return;
      }
      if (this.#currentContentFormService && services.includes(this.#currentContentFormService)) {
        return;
      }
      if (this.#serviceRegisteredSubscription) {
        this.#serviceRegisteredSubscription.unsubscribe();
      }
      this.#logger.debug("ContentFormService is registered now, listening for activeEntity will be started");
      this.#currentContentFormService = services[0];
      this.#listenForActiveEntityChanges(this.#currentContentFormService);
    };
    this.#serviceRegisteredSubscription = serviceAgent
      .observeServices<ContentFormService>(createContentFormServiceDescriptor())
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
      const { formView, toolbarView } = requireNonNullsAugmentedLinkUI(linkUI, "formView", "toolbarView");
      const commandValue: string = linkCommand.value ?? "";
      const value = CONTENT_CKE_MODEL_URI_REGEXP.test(commandValue) ? commandValue : undefined;
      formView.set({
        contentUriPath: value,
      });
      toolbarView.set({
        contentUriPath: value,
      });
    };
  }
}
