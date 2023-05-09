/* eslint no-null/no-null: off */

import { Command, Plugin } from "@ckeditor/ckeditor5-core";
import { LinkUI } from "@ckeditor/ckeditor5-link";
// LinkActionsView: See ckeditor/ckeditor5#12027.
import LinkActionsView from "@ckeditor/ckeditor5-link/src/ui/linkactionsview";
import ContentLinkView from "./ContentLinkView";
import { requireContentUriPath, isModelUriPath, UriPath } from "@coremedia/ckeditor5-coremedia-studio-integration";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/src/Plugins";
import { handleFocusManagement } from "@coremedia/ckeditor5-link-common/src/FocusUtils";
import { ContextualBalloon } from "@ckeditor/ckeditor5-ui";
import { LINK_COMMAND_NAME } from "@coremedia/ckeditor5-link-common/src/Constants";
import { ifCommand } from "@coremedia/ckeditor5-core-common/src/Commands";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import { hasContentUriPath } from "./ViewExtensions";
import { showContentLinkField } from "../ContentLinkViewUtils";
import { asAugmentedLinkUI, AugmentedLinkUI, requireNonNullsAugmentedLinkUI } from "./AugmentedLinkUI";
import { AugmentedLinkActionsView } from "./AugmentedLinkActionsView";
import { executeOpenContentInTabCommand } from "../OpenContentInTabCommand";

/**
 * Extends the action view for Content link display. This includes:
 *
 * * render name of linked content (or placeholder for unreadable content)
 * * provide `onClick` handler to open a content in a new Studio tab
 *     (rather than opening an external URL in a new browser tab).
 */
class ContentLinkActionsViewExtension extends Plugin {
  public static readonly pluginName = "ContentLinkActionsViewExtension" as const;
  static readonly #logger = LoggerProvider.getLogger(ContentLinkActionsViewExtension.pluginName);

  static readonly requires = [LinkUI, ContextualBalloon];
  contentUriPath: string | undefined | null;
  #initialized = false;

  init(): void {
    const initInformation = reportInitStart(this);
    const editor = this.editor;
    const linkUI = asAugmentedLinkUI(editor.plugins.get(LinkUI));
    const contextualBalloon: ContextualBalloon = editor.plugins.get(ContextualBalloon);

    contextualBalloon.on("change:visibleView", (evt, name, visibleView) => {
      const { actionsView } = linkUI;
      if (actionsView && actionsView === visibleView && !this.#initialized) {
        this.#initialize(linkUI, actionsView);
        this.#initialized = true;
      }
    });

    contextualBalloon.on("change:visibleView", (evt, name, visibleView) => {
      const { actionsView } = linkUI;
      if (actionsView && actionsView === visibleView) {
        ContentLinkActionsViewExtension.#addCoreMediaClassesToActionsView(actionsView);
      }
    });

    reportInitEnd(initInformation);
  }

  #initialize(linkUI: AugmentedLinkUI, actionsView: AugmentedLinkActionsView): void {
    const { editor } = linkUI;

    actionsView.set({
      contentUriPath: undefined,
    });

    const bindContentUriPathTo = (command: Command): void => {
      actionsView
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
    actionsView.on("change:contentUriPath", (evt) => {
      const { source } = evt;

      if (!hasContentUriPath(source)) {
        // set visibility of url and content field
        showContentLinkField(actionsView, false);
        return;
      }

      const { contentUriPath: value } = source;

      // set visibility of url and content field
      showContentLinkField(actionsView, !!value);
    });
    this.#extendView(linkUI, actionsView);
  }

  #extendView(linkUI: AugmentedLinkUI, actionsView: AugmentedLinkActionsView): void {
    const logger = ContentLinkActionsViewExtension.#logger;
    const { formView } = requireNonNullsAugmentedLinkUI(linkUI, "formView");

    const contentLinkView = new ContentLinkView(this.editor, {
      renderTypeIcon: true,
    });

    contentLinkView.set({
      renderAsTextLink: true,
    });

    if (!hasContentUriPath(linkUI.actionsView)) {
      logger.warn("ActionsView does not have a property contentUriPath. Is it already bound?", linkUI.actionsView);
      return;
    }

    contentLinkView.bind("uriPath").to(actionsView, "contentUriPath");

    contentLinkView.on("contentClick", () => {
      const { uriPath } = contentLinkView;
      if (uriPath) {
        logger.debug(`Executing OpenContentInTabCommand for: ${uriPath}.`);
        const uriPaths: UriPath[] = [requireContentUriPath(uriPath)];
        executeOpenContentInTabCommand(this.editor, uriPaths);
      }
    });

    contentLinkView.on("change:contentName", () => {
      if (!this.editor.isReadOnly) {
        const contextualBalloon: ContextualBalloon = this.editor.plugins.get(ContextualBalloon);
        if (contextualBalloon.visibleView && contextualBalloon.visibleView === linkUI.actionsView) {
          contextualBalloon.updatePosition();
        }
      }
    });

    ContentLinkActionsViewExtension.#render(actionsView, contentLinkView);

    formView.on("cancel", () => {
      const initialValue: string = this.editor.commands.get("link")?.value as string;
      actionsView.set({
        contentUriPath: isModelUriPath(initialValue) ? initialValue : null,
      });
    });
  }

  static #render(actionsView: LinkActionsView, simpleContentLinkView: ContentLinkView): void {
    if (!actionsView.element || !actionsView.editButtonView.element) {
      ContentLinkActionsViewExtension.#logger.error(
        "ActionsView or the edit button has no element yet, this indicates the actionsView is not rendered yet. Can't customize.",
        actionsView
      );
      return;
    }
    actionsView.registerChild(simpleContentLinkView);
    if (!simpleContentLinkView.isRendered) {
      simpleContentLinkView.render();
    }
    if (!simpleContentLinkView.element) {
      ContentLinkActionsViewExtension.#logger.error(
        "ContentLinkView is rendered, but element does not exist.",
        simpleContentLinkView
      );
      return;
    }

    actionsView.element.insertBefore(simpleContentLinkView.element, actionsView.editButtonView.element);
    ContentLinkActionsViewExtension.#addCoreMediaClassesToActionsView(actionsView);
    handleFocusManagement(actionsView, [simpleContentLinkView], actionsView.previewButtonView);
  }

  /**
   * Add classes to the actions view that enables to distinguish if the extension is active.
   *
   * @param actionsView - the rendered actionsView of the linkUI
   * @private
   */
  static #addCoreMediaClassesToActionsView(actionsView: LinkActionsView): void {
    if (!actionsView.isRendered) {
      ContentLinkActionsViewExtension.#logger.warn(
        "ActionsView is not rendered yet, but classes must be added to the rendered actionsView",
        actionsView
      );
      return;
    }

    const CM_FORM_VIEW_CLS = "cm-ck-link-actions-view";
    const CM_PREVIEW_BUTTON_VIEW_CLS = "cm-ck-link-actions-preview";
    actionsView.element?.classList.add(CM_FORM_VIEW_CLS);
    actionsView.previewButtonView.element?.classList.add(CM_PREVIEW_BUTTON_VIEW_CLS);
  }
}

export default ContentLinkActionsViewExtension;
