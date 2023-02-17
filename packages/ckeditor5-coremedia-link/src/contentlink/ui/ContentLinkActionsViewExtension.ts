/* eslint no-null/no-null: off */

import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import LinkActionsView from "@ckeditor/ckeditor5-link/src/ui/linkactionsview";
import ContentLinkView from "./ContentLinkView";
import { CONTENT_CKE_MODEL_URI_REGEXP } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import { handleFocusManagement, LinkViewWithFocusables } from "../../link/FocusUtils";
import ContextualBalloon from "@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon";
import Command from "@ckeditor/ckeditor5-core/src/command";
import { LINK_COMMAND_NAME } from "../../link/Constants";
import { ifCommand } from "@coremedia/ckeditor5-core-common/Commands";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import { hasContentUriPath } from "./ViewExtensions";
import { showContentLinkField } from "../ContentLinkViewUtils";

/**
 * Extends the action view for Content link display. This includes:
 *
 * * render name of linked content (or placeholder for unreadable content)
 * * provide `onClick` handler to open a content in a new Studio tab
 *     (rather than opening an external URL in a new browser tab).
 */
class ContentLinkActionsViewExtension extends Plugin {
  static readonly pluginName: string = "ContentLinkActionsViewExtension";
  static readonly #logger = LoggerProvider.getLogger(ContentLinkActionsViewExtension.pluginName);

  static readonly requires = [LinkUI];

  #initialized = false;

  init(): void {
    const initInformation = reportInitStart(this);
    const editor = this.editor;
    const linkUI: LinkUI = editor.plugins.get(LinkUI);
    const contextualBalloon: ContextualBalloon = editor.plugins.get(ContextualBalloon);

    contextualBalloon.on("change:visibleView", (evt, name, visibleView) => {
      if (linkUI.actionsView === visibleView && !this.#initialized) {
        this.#initialize(linkUI);
        this.#initialized = true;
      }
    });

    contextualBalloon.on("change:visibleView", (evt, name, visibleView) => {
      if (linkUI.actionsView === visibleView) {
        ContentLinkActionsViewExtension.#addCoreMediaClassesToActionsView(linkUI.actionsView);
      }
    });

    reportInitEnd(initInformation);
  }

  #initialize(linkUI: LinkUI): void {
    const { editor } = linkUI;

    linkUI.actionsView.set({
      contentUriPath: undefined,
    });

    const bindContentUriPathTo = (command: Command): void => {
      linkUI.actionsView
        .bind("contentUriPath")
        .to(command, "value", (value: unknown) =>
          typeof value === "string" && CONTENT_CKE_MODEL_URI_REGEXP.test(value) ? value : undefined
        );
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
    linkUI.actionsView.on("change:contentUriPath", (evt) => {
      const { source } = evt;

      if (!hasContentUriPath(source)) {
        // set visibility of url and content field
        showContentLinkField(linkUI.actionsView, false);
        return;
      }

      const { contentUriPath: value } = source;

      // set visibility of url and content field
      showContentLinkField(linkUI.actionsView, !!value);
    });
    this.#extendView(linkUI);
  }

  #extendView(linkUI: LinkUI): void {
    const { formView } = linkUI;
    const actionsView: LinkActionsView = linkUI.actionsView;
    const contentLinkView = new ContentLinkView(this.editor, {
      renderTypeIcon: true,
    });
    contentLinkView.set({
      renderAsTextLink: true,
    });
    if (!hasContentUriPath(linkUI.actionsView)) {
      ContentLinkActionsViewExtension.#logger.warn(
        "ActionsView does not have a property contentUriPath. Is it already bound?",
        linkUI.actionsView
      );
      return;
    }
    contentLinkView.bind("uriPath").to(linkUI.actionsView, "contentUriPath");

    contentLinkView.on("contentClick", () => {
      if (contentLinkView.uriPath) {
        this.editor.commands.get("openLinkInTab")?.execute();
      }
    });

    ContentLinkActionsViewExtension.#render(actionsView, contentLinkView);

    formView.on("cancel", () => {
      const initialValue: string = this.editor.commands.get("link")?.value as string;
      linkUI.actionsView.set({
        contentUriPath: CONTENT_CKE_MODEL_URI_REGEXP.test(initialValue) ? initialValue : null,
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
    const linkViewWithFocusable = actionsView as LinkViewWithFocusables;
    handleFocusManagement(linkViewWithFocusable, [simpleContentLinkView], actionsView.previewButtonView);
  }

  /**
   * Add classes to the actions view which enables to distinguish if the extension is active.
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
