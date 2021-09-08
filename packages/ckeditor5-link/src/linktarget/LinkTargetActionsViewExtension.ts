import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import LinkActionsView from "@ckeditor/ckeditor5-link/src/ui/linkactionsview";
import Logger from "@coremedia/coremedia-utils/logging/Logger";
import LoggerProvider from "@coremedia/coremedia-utils/logging/LoggerProvider";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import { parseLinkTargetConfig } from "./config/LinkTargetConfig";
import LinkTargetOptionDefinition from "./config/LinkTargetOptionDefinition";
import Command from "@ckeditor/ckeditor5-core/src/command";
import CustomLinkTargetUI from "./ui/CustomLinkTargetUI";
import { OTHER_TARGET_NAME } from "./config/DefaultTarget";

/**
 * Extends the action view of the linkUI plugin for link target display. This includes:
 *
 * * render toggle buttons in the action view of the linkUI to indicate the set target of a given link
 * * executing a button will result in setting the target of a given link
 *
 * When clicking the "Open in Frame" button, an additional balloon with a text input
 * opens and allows to set a custom target.
 *
 * The buttons to be rendered can be set in the editor's configuration.
 * The default configuration is defined in @see {@link DefaultTarget}.
 */
class LinkTargetActionsViewExtension extends Plugin {
  static readonly pluginName: string = "LinkTargetActionsViewExtension";
  static readonly #logger: Logger = LoggerProvider.getLogger(LinkTargetActionsViewExtension.pluginName);

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [LinkUI, CustomLinkTargetUI];
  }

  init(): Promise<void> | null {
    const logger = LinkTargetActionsViewExtension.#logger;
    const startTimestamp = performance.now();

    logger.debug(`Initializing ${LinkTargetActionsViewExtension.pluginName}...`);

    const editor = this.editor;
    const linkUI: LinkUI = <LinkUI>editor.plugins.get(LinkUI);

    this.#extendView(linkUI);

    logger.debug(
      `Initialized ${LinkTargetActionsViewExtension.pluginName} within ${performance.now() - startTimestamp} ms.`
    );

    return null;
  }

  /**
   * Extends the actions view of the linkUI plugin by adding target buttons right
   * before the {@link unlinkButtonView} element. The order of buttons is defined
   * by the editor's configuration, respectively the order of default targets
   * in {@link DefaultTarget}.
   *
   * @param linkUI the linkUI plugin
   * @private
   */
  #extendView(linkUI: LinkUI): void {
    const actionsView: LinkActionsView = linkUI.actionsView;
    const linkTargetCommand = this.editor.commands.get("linkTarget");
    const linkTargetDefinitions = parseLinkTargetConfig(this.editor.config);

    // convert button configurations to buttonView instances
    const buttons = linkTargetDefinitions.map((buttonConfig) => {
      if (buttonConfig.name === OTHER_TARGET_NAME) {
        return <ButtonView>this.editor.ui.componentFactory.create(CustomLinkTargetUI.customTargetButtonName);
      } else {
        return this.#createTargetButton(buttonConfig, linkTargetCommand);
      }
    });

    // we register all buttons to let the actions view handle the rendering from now on
    actionsView.registerChild(buttons);

    // no need to render the buttons manually, just add them to the DOM
    actionsView.once("render", () => this.#addButtons(actionsView, buttons));
  }

  /**
   * Creates and returns an instance of a buttonView for link target representation.
   * The buttons are bound to {@link LinkTargetCommand} to set the target on execute
   * and toggle their state accordingly.
   *
   * @param buttonConfig configuration for the button
   * @param linkTargetCommand command to execute on click
   * @private
   */
  #createTargetButton(buttonConfig: LinkTargetOptionDefinition, linkTargetCommand: Command | undefined): ButtonView {
    const view = new ButtonView();
    view.set({
      label: buttonConfig.title || buttonConfig.name,
      tooltip: true,
      icon: buttonConfig.icon,
      withText: !buttonConfig.icon,
      isToggleable: true,
    });

    view
      .bind("isOn")
      .to(
        linkTargetCommand,
        "value",
        (value: string) => value === buttonConfig.name || (value === undefined && buttonConfig.name === "_self")
      );

    view.on("execute", () => {
      linkTargetCommand?.execute(buttonConfig.name);
    });

    return view;
  }

  /**
   * Adds button elements right before the {@link unlinkButtonView} element in the actions view.
   *
   * @param actionsView CKEditor's `LinkActionsView` to extend
   * @param buttons the buttons to add in the given order
   * @private
   */
  #addButtons(actionsView: LinkActionsView, buttons: ButtonView[]): void {
    buttons.forEach((button) => {
      actionsView.element.insertBefore(button.element, actionsView.unlinkButtonView.element);
    });
  }
}

export default LinkTargetActionsViewExtension;
