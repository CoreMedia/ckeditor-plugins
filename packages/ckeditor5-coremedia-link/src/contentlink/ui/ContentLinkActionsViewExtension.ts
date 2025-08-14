import ContentLinkView from "./ContentLinkView";
import type { UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { isModelUriPath, requireContentUriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { ifCommand, reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import { LINK_COMMAND_NAME } from "@coremedia/ckeditor5-link-common";
import { Command, ContextualBalloon, LinkUI, Plugin, ToolbarView } from "ckeditor5";
import { LoggerProvider } from "@coremedia/ckeditor5-logging";
import { hasContentUriPath } from "./ViewExtensions";
import { showContentLinkField } from "../ContentLinkViewUtils";
import { asAugmentedLinkUI, AugmentedLinkUI } from "./AugmentedLinkUI";
import { AugmentedLinkActionsView } from "./AugmentedLinkActionsView";
import { executeOpenContentInTabCommand } from "../OpenContentInTabCommand";

export const CONTENT_LINK_VIEW_COMPONENT_NAME = "contentLinkView";

/**
 * Extends the action view for Content link display. This includes:
 *
 * * render name of linked content (or placeholder for unreadable content)
 * * provide `onClick` handler to open a content in a new Studio tab
 *     (rather than opening an external URL in a new browser tab).
 */
class ContentLinkActionsViewExtension extends Plugin {
  public static readonly pluginName = "ContentLinkActionsViewExtension" as const;
  static readonly #logger = LoggerProvider.getLogger("ContentLinkActionsViewExtension");
  static readonly requires = [LinkUI, ContextualBalloon];
  contentUriPath: string | undefined | null;
  #initialized = false;
  contentLinkView?: ContentLinkView = undefined;

  init(): void {
    const initInformation = reportInitStart(this);
    const editor = this.editor;
    const linkUI = asAugmentedLinkUI(editor.plugins.get(LinkUI));
    const contextualBalloon: ContextualBalloon = editor.plugins.get(ContextualBalloon);

    contextualBalloon.on("change:visibleView", (evt, name, visibleView) => {
      const { toolbarView } = linkUI;
      if (toolbarView && toolbarView === visibleView) {
        ContentLinkActionsViewExtension.#addCoreMediaClassesToActionsView(toolbarView);
      }
      if (toolbarView && toolbarView === visibleView && !this.#initialized) {
        this.#initialize(linkUI, toolbarView);
        this.#initialized = true;
      }
    });

    this.#registerContentLinkViewButton(linkUI);

    reportInitEnd(initInformation);
  }

  #initialize(linkUI: AugmentedLinkUI, toolbarView: AugmentedLinkActionsView): void {
    const { editor } = linkUI;

    toolbarView.set({
      contentUriPath: undefined,
    });
    const bindContentUriPathTo = (command: Command): void => {
      toolbarView
        .bind("contentUriPath")
        .to(command, "value", (value: unknown) => (isModelUriPath(value) ? value : undefined));
    };
    ifCommand(editor, LINK_COMMAND_NAME)
      .then((command) => bindContentUriPathTo(command))
      .catch((e) => {
        ContentLinkActionsViewExtension.#logger.warn(e);
      });

    /*
     * We need to update the visibility of the inputs when the value of the content link changes
     * If the value was removed: show external link field, otherwise show the content link field
     */
    toolbarView.on("change:contentUriPath", (evt) => {
      const { source } = evt;
      if (!hasContentUriPath(source)) {
        // set visibility of url and content field
        showContentLinkField(toolbarView, false);
        return;
      }
      const { contentUriPath: value } = source;

      // set visibility of url and content field
      showContentLinkField(toolbarView, !!value);
    });

    if (this.contentLinkView) {
      // @ts-expect-error should not be stored in toolbarView anymore?!
      this.contentLinkView.bind("uriPath").to(linkUI.toolbarView, "contentUriPath");
    }
  }

  #registerContentLinkViewButton(linkUI: AugmentedLinkUI): void {
    const editor = this.editor;
    const logger = ContentLinkActionsViewExtension.#logger;

    editor.ui.componentFactory.add(CONTENT_LINK_VIEW_COMPONENT_NAME, () => {
      const contentLinkView = new ContentLinkView(this.editor, {
        renderTypeIcon: true,
      });
      contentLinkView.set({
        renderAsTextLink: true,
      });
      contentLinkView.on("contentClick", () => {
        const { uriPath } = contentLinkView;
        if (uriPath) {
          logger.debug(`Executing OpenContentInTabCommand for: ${uriPath}.`);
          const uriPaths: UriPath[] = [requireContentUriPath(uriPath)];
          executeOpenContentInTabCommand(this.editor, uriPaths)
            ?.then((result) => {
              logger.debug("Result for OpenContentInTabCommand by click:", result);
            })
            .catch((reason) => {
              logger.warn("Failed executing OpenContentInTabCommand invoked by click:", reason);
            });
        }
      });
      contentLinkView.on("change:contentName", () => {
        if (!this.editor.isReadOnly) {
          const contextualBalloon: ContextualBalloon = this.editor.plugins.get(ContextualBalloon);
          if (contextualBalloon.visibleView && contextualBalloon.visibleView === linkUI.toolbarView) {
            contextualBalloon.updatePosition();
          }
        }
      });

      linkUI.formView?.on("cancel", () => {
        const initialValue: string = this.editor.commands.get("link")?.value as string;
        linkUI.toolbarView?.set({
          contentUriPath: isModelUriPath(initialValue) ? initialValue : null,
        });
      });

      this.contentLinkView = contentLinkView;

      return contentLinkView;
    });
  }

  /**
   * Add classes to the toolbar view that enables to distinguish if the extension is active.
   *
   * @param toolbarView - the rendered toolbarView of the linkUI
   * @private
   */
  static #addCoreMediaClassesToActionsView(toolbarView: ToolbarView): void {
    if (!toolbarView.isRendered) {
      ContentLinkActionsViewExtension.#logger.warn(
        "ToolbarView is not rendered yet, but classes must be added to the rendered toolbarView",
        toolbarView,
      );
      return;
    }
    const CM_FORM_VIEW_CLS = "cm-ck-link-actions-view";
    toolbarView.element?.classList.add(CM_FORM_VIEW_CLS);
  }
}

export default ContentLinkActionsViewExtension;
