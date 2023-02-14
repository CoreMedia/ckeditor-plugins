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

  init(): void {
    const initInformation = reportInitStart(this);
    const editor = this.editor;
    const linkUI: LinkUI = editor.plugins.get(LinkUI);
    const contextualBalloon: ContextualBalloon = editor.plugins.get(ContextualBalloon);
    contextualBalloon.on("change:visibleView", (evt, name, visibleView) => {
      if (linkUI.actionsView === visibleView) {
        this.onVisibleViewChanged(linkUI);
      }
    });

    reportInitEnd(initInformation);
  }

  onVisibleViewChanged(linkUI: LinkUI): void {
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
    const contentLinkView = new ContentLinkView(this.editor.locale, linkUI, {
      renderTypeIcon: true,
    });
    contentLinkView.set({
      renderAsTextLink: true,
    });
    // @ts-expect-error TODO: Check Typings or provide some workaround.
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
    actionsView.registerChild(simpleContentLinkView);
    if (!simpleContentLinkView.isRendered) {
      simpleContentLinkView.render();
    }
    // @ts-expect-error TODO: Element may be null; we should check that
    actionsView.element.insertBefore(simpleContentLinkView.element, actionsView.editButtonView.element);
    const linkViewWithFocusable = actionsView as LinkViewWithFocusables;
    handleFocusManagement(linkViewWithFocusable, [simpleContentLinkView], actionsView.previewButtonView);
  }
}

export default ContentLinkActionsViewExtension;
