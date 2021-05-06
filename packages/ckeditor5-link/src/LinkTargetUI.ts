import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/index";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import LinkFormViewExtension from "./ui/LinkFormViewExtension";
import LinkEditing from "@ckeditor/ckeditor5-link/src/linkediting";

/**
 * Adds an attribute `linkTarget` to the model, which will be represented
 * as `target` attribute in view.
 *
 * @see <a href="https://stackoverflow.com/questions/51303892/how-to-add-target-attribute-to-a-tag-in-ckeditor5">How to add "target" attribute to `a` tag in ckeditor5? - Stack Overflow</a>
 */
export default class LinkTargetUI extends Plugin {
  static readonly pluginName: string = "LinkTargetUI";
  private readonly logger: Logger = LoggerProvider.getLogger(LinkTargetUI.pluginName);

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [LinkUI, LinkEditing];
  }

  private formExtension?: LinkFormViewExtension;

  init(): Promise<void> | null {
    const startTimestamp = performance.now();

    this.logger.debug(`Initializing ${LinkTargetUI.pluginName}...`);

    const editor = this.editor;
    const linkUI: LinkUI = <LinkUI>editor.plugins.get(LinkUI);

    this.formExtension = this._extendFormView(linkUI);

    this.logger.debug(`Initialized ${LinkTargetUI.pluginName} within ${performance.now() - startTimestamp} ms.`);
    return null;
  }

  /*
   * Design notes:
   *
   * * Just as linkUi we need to listen to formView.submit to read the input
   *   fields. We may need to ensure a higher priority.
   * * We may need to move the addition of linkTarget attribute to a command
   *   which is then executed.
   */
  private _extendFormView(linkUI: LinkUI): LinkFormViewExtension {
    const editor = this.editor;
    const linkCommand = editor.commands.get("link");
    const linkTargetCommand = editor.commands.get("linkTarget");
    const formView = linkUI.formView;
    const extension = new LinkFormViewExtension(formView);
    extension.targetInputView.fieldView.bind("value").to(linkTargetCommand, "value");
    // TODO[cke] We need to fix the typing of bind regarding the bind parameters.
    // @ts-ignore
    extension.targetInputView.bind("isReadOnly").to(linkCommand, "isEnabled", (value) => !value);

    this.listenTo(
      formView,
      "submit",
      () => {
        const { value } = <HTMLInputElement>extension.targetInputView.fieldView.element;
        editor.execute("linkTarget", value);
      },
      /*
       * We need a higher listener priority here than for `LinkCommand`.
       * This is because we want to listen to any changes to the model
       * triggered by LinkCommand.
       *
       * This is actually a workaround regarding a corresponding extension
       * point to the link command.
       */
      {
        priority: "high",
      }
    );

    return extension;
  }

  destroy(): Promise<never> | null {
    this.formExtension?.destroy();
    return null;
  }
}
