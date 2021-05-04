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

  private _extendFormView(linkUI: LinkUI): LinkFormViewExtension {
    const editor = this.editor;
    const linkCommand = editor.commands.get('link');
    const formView = linkUI.formView;
    const extension = new LinkFormViewExtension(formView);
    // extension.targetInputView.fieldView.bind("value").to(/* TODO[cke] */);
    // TODO[cke] We need to fix the typing of bind regarding the bind parameters.
    // @ts-ignore
    extension.targetInputView.bind("isReadOnly").to(linkCommand, "isEnabled", (value) => !value);

/*
    this.listenTo(
      formView,
      "submit",
      () => {
        /!* TODO[cke] Write value to model?!? *!/
      },
      {
        priority: "high",
      }
    );
*/
    return extension;
  }

  destroy(): Promise<never> | null {
    this.formExtension?.destroy();
    return null;
  }
}
