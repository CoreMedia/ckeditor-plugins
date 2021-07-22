import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import LinkActionsView from "@ckeditor/ckeditor5-link/src/ui/linkactionsview";
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/src";

/**
 * Extends the action view for Content link display. This includes:
 *
 * * render name of linked content (or placeholder for unreadable content)
 * * provide `onClick` handler to open a content in a new Studio tab
 *     (rather than opening an external URL in a new browser tab).
 */
class LinkActionsViewExtension extends Plugin {
  static readonly pluginName: string = "LinkActionsViewExtension";
  static readonly #logger: Logger = LoggerProvider.getLogger(LinkActionsViewExtension.pluginName);

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [LinkUI];
  }

  init(): Promise<void> | null {
    const startTimestamp = performance.now();

    LinkActionsViewExtension.#logger.debug(`Initializing ${LinkActionsViewExtension.pluginName}...`);

    const editor = this.editor;
    const linkUI: LinkUI = <LinkUI>editor.plugins.get(LinkUI);

    this.#extendView(linkUI);

    LinkActionsViewExtension.#logger.debug(
      `Initialized ${LinkActionsViewExtension.pluginName} within ${performance.now() - startTimestamp} ms.`
    );

    return null;
  }

  #extendView(linkUI: LinkUI): void {
    const editor = this.editor;
    const linkCommand = editor.commands.get("link");
    const actionsView: LinkActionsView = linkUI.actionsView;
  }
}

export default LinkActionsViewExtension;
