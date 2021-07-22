import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import LinkActionsView from "@ckeditor/ckeditor5-link/src/ui/linkactionsview";
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/index";

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

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [LinkUI];
  }

  init(): Promise<void> | null {
    const startTimestamp = performance.now();

    ContentLinkActionsViewExtension.#logger.debug(`Initializing ${ContentLinkActionsViewExtension.pluginName}...`);

    const editor = this.editor;
    const linkUI: LinkUI = <LinkUI>editor.plugins.get(LinkUI);

    this.#extendView(linkUI);

    ContentLinkActionsViewExtension.#logger.debug(
      `Initialized ${ContentLinkActionsViewExtension.pluginName} within ${performance.now() - startTimestamp} ms.`
    );

    return null;
  }

  #extendView(linkUI: LinkUI): void {
    const editor = this.editor;
    const linkCommand = editor.commands.get("link");
    const actionsView: LinkActionsView = linkUI.actionsView;
    actionsView.once("render", () => ContentLinkActionsViewExtension.#render(actionsView));
  }

  static #render(actionsView: LinkActionsView): void {
    ContentLinkActionsViewExtension.#renderPreviewButton(actionsView);
  }

  static #renderPreviewButton(actionsView: LinkActionsView): void {
    const previewButtonView = actionsView.previewButtonView;
    previewButtonView.on("execute", (eventInfo) => {
      console.log("Clicked preview button.", { eventInfo: eventInfo });
      // Are we an internal link? Use open tab instead.
      // Can we listen and prevent further execution?
      // Do we need to de-register on destroy?
      // Can we actually listen to execute? It seems LinkActionsView prevents default
      // events as defined in https://github.com/ckeditor/ckeditor5/blob/287e04574d7b662d8d051cd12975e5ef871ff6df/packages/ckeditor5-ui/src/button/buttonview.js#L153-L170
    });
  }
}

export default ContentLinkActionsViewExtension;
