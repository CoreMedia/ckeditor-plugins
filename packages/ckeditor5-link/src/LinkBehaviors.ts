import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import { Logger, LoggerProvider } from "@coremedia/coremedia-utils/index";
import { COREMEDIA_LINKBEHAVIORS_PLUGIN_NAME } from "./Constants";
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";

/**
 * Adds link behaviors (open in new tab, specify custom target, et al.)
 */
export default class LinkBehaviors extends Plugin {
  static readonly pluginName: string = COREMEDIA_LINKBEHAVIORS_PLUGIN_NAME;
  private readonly logger: Logger = LoggerProvider.getLogger(COREMEDIA_LINKBEHAVIORS_PLUGIN_NAME);
  button: ButtonView | undefined;

  /**
   * LinkFormView from Link plugin to be customized. Initialized on `init`, thus
   * may be undefined before `init` got called.
   */
  linkFormView: LinkFormView | undefined;

  constructor(editor: Editor) {
    super(editor);
  }

  init(): Promise<void> | null {
    const startTimestamp = performance.now();

    this.logger.info(`Initializing ${LinkBehaviors.pluginName}...`);

    const editor = this.editor;
    const linkUI: LinkUI = <LinkUI>editor.plugins.get(LinkUI);

    this.linkFormView = linkUI.formView;
    this.button = this._createButton();

    this.linkFormView.once("render", () => this._renderButton());

    this.logger.info(`Initialized ${LinkBehaviors.pluginName} within ${performance.now() - startTimestamp} ms.`);

    return null;
  }

  private _renderButton(): void {
    if (!this.button || !this.linkFormView) {
      this.logger.debug("Invalid state. Called to render button without button or linkFormView been initialized.");
      return;
    }
    // Render button's template.
    this.button.render();

    // Register the button under the link form view, it will handle its destruction.
    this.linkFormView.registerChild(this.button);

    // Inject the element into DOM.
    this.linkFormView.element.insertBefore(this.button.element, this.linkFormView.saveButtonView.element);
  }

  private _createButton(): ButtonView {
    const editor = this.editor;
    const button = new ButtonView(this.editor.locale);
    const linkCommand = editor.commands.get("link");

    button.set({
      label: "Internal link",
      withText: true,
      tooltip: true,
    });

    // Probably this button should be also disabled when the link command is disabled.
    // Try setting editor.isReadOnly = true to see it in action.
    button.bind("isEnabled").to(linkCommand);

    button.on("execute", () => {
      // Do something (like open the popup), then update the link URL field's value.
      // The line below will be probably executed inside some callback.
      // this.linkFormView.urlInputView.fieldView.element.value = 'http://some.internal.link';
      this.logger.warn("Button action not finished yet.");
    });

    return button;
  }
}
