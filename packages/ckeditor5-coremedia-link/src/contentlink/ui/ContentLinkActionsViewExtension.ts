import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import LinkActionsView from "@ckeditor/ckeditor5-link/src/ui/linkactionsview";
import Logger from "@coremedia/ckeditor5-logging/logging/Logger";
import LoggerProvider from "@coremedia/ckeditor5-logging/logging/LoggerProvider";
import ContentLinkView from "./ContentLinkView";
import { CONTENT_CKE_MODEL_URI_REGEXP } from "@coremedia/ckeditor5-coremedia-studio-integration/content/UriPath";
import { openInTab, showContentLinkField } from "../ContentLinkViewUtils";
import { ifCommand } from "@coremedia/ckeditor5-common/Commands";
import { LINK_COMMAND_NAME } from "../../link/Constants";
import { Command } from "@ckeditor/ckeditor5-core";
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import { hasContentUriPath } from "./ViewExtensions";

/**
 * Extends the action view for Content link display. This includes:
 *
 * * render name of linked content (or placeholder for unreadable content)
 * * provide `onClick` handler to open a content in a new Studio tab
 *     (rather than opening an external URL in a new browser tab).
 */
class ContentLinkActionsViewExtension extends Plugin {
  static readonly pluginName: string = "ContentLinkActionsViewExtension";
  static readonly #logger: Logger = LoggerProvider.getLogger(ContentLinkActionsViewExtension.pluginName);

  static readonly requires = [LinkUI];

  async init(): Promise<void> {
    const logger = ContentLinkActionsViewExtension.#logger;
    const startTimestamp = performance.now();

    logger.debug(`Initializing ${ContentLinkActionsViewExtension.pluginName}...`);

    const editor = this.editor;
    const linkUI: LinkUI = editor.plugins.get(LinkUI);

    linkUI.actionsView.set({
      contentUriPath: undefined,
    });

    const bindContentUriPathTo = (command: Command): void => {
      linkUI.actionsView.bind("contentUriPath").to(command, "value", (value: unknown) => {
        return typeof value === "string" && CONTENT_CKE_MODEL_URI_REGEXP.test(value) ? value : undefined;
      });
    };

    await ifCommand(editor, LINK_COMMAND_NAME).then((command) => bindContentUriPathTo(command));

    /*
     * We need to update the visibility of the inputs when the value of the content link changes
     * If the value was removed: show external link field, otherwise show the content link field
     */
    linkUI.actionsView.on("change:contentUriPath", (evt) => {
      const { source } = evt;
      if (!hasContentUriPath(source)) {
        return;
      }

      // @ts-expect-error Bad Typing: DefinitelyTyped/DefinitelyTyped#60975
      const formView: LinkFormView = linkUI.formView;
      const { contentUriPath: value } = source;

      // content link value has changed. set urlInputView accordingly
      // value is null if it was set by cancelling and reopening the dialog, resetting the dialog should not
      // re-trigger a set of utlInputView here
      if (value !== null) {
        formView.urlInputView.fieldView.set({
          value: value || "",
        });
      }

      // set visibility of url and content field
      showContentLinkField(formView, !!value);
      showContentLinkField(linkUI.actionsView, !!value);
    });

    this.#extendView(linkUI);

    logger.debug(
      `Initialized ${ContentLinkActionsViewExtension.pluginName} within ${performance.now() - startTimestamp} ms.`
    );
  }

  #extendView(linkUI: LinkUI): void {
    // @ts-expect-error Bad Typing: DefinitelyTyped/DefinitelyTyped#60975
    const formView: LinkFormView = linkUI.formView;
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
        openInTab(contentLinkView.uriPath);
      }
    });

    actionsView.once("render", () => ContentLinkActionsViewExtension.#render(actionsView, contentLinkView));

    formView.on("cancel", () => {
      const initialValue: string = <string>this.editor.commands.get("link")?.value;
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
  }
}

export default ContentLinkActionsViewExtension;
