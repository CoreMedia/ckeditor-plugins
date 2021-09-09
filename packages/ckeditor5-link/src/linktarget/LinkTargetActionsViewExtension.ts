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
import ToolbarSeparatorView from "@ckeditor/ckeditor5-ui/src/toolbar/toolbarseparatorview";
import View from "@ckeditor/ckeditor5-ui/src/view";
import "./theme/linktargetactionsviewextension.css";

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
    const linkTargetDefinitions = parseLinkTargetConfig(this.editor.config, this.editor.locale);

    // convert button configurations to buttonView instances
    const buttons = linkTargetDefinitions.map((buttonConfig) => {
      if (buttonConfig.name === OTHER_TARGET_NAME) {
        return <ButtonView>this.editor.ui.componentFactory.create(CustomLinkTargetUI.customTargetButtonName);
      } else {
        return this.#createTargetButton(buttonConfig, linkTargetCommand);
      }
    });

    const separatorLeft = new ToolbarSeparatorView();
    separatorLeft.set({ class: "cm-ck-item-separator" });
    separatorLeft.extendTemplate({
      attributes: {
        class: ["cm-ck-item-separator", "cm-ck-item-separator--left"],
      },
    });
    const separatorRight = new ToolbarSeparatorView();
    separatorRight.extendTemplate({
      attributes: {
        class: ["cm-ck-item-separator", "cm-ck-item-separator--right"],
      },
    });

    // we register all buttons to let the actions view handle the rendering from now on
    if (buttons.length > 0) {
      actionsView.registerChild([separatorLeft, separatorRight, ...buttons]);

      // no need to render the buttons manually, just add them to the DOM
      actionsView.once("render", () => this.#addButtons(actionsView, [separatorLeft, ...buttons, separatorRight]));
    }
  }

  /**
   * Creates and returns an instance of a buttonView for link target representation.
   * The buttons are bound to {@link LinkTargetCommand} to set the target on execute
   * and toggle their state accordingly.
   *
   * Buttons created by this method directly set the target value they are bound
   * to. For a custom target input field, use `CustomLinkTargetUI`.
   *
   * @param buttonConfig configuration for the button
   * @param linkTargetCommand command to execute on click
   * @private
   */
  #createTargetButton(buttonConfig: LinkTargetOptionDefinition, linkTargetCommand: Command | undefined): ButtonView {
    const view = new ButtonView();
    view.set({
      label: buttonConfig.title || buttonConfig.name,
      class: "cm-ck-target-button",
      tooltip: true,
      icon: buttonConfig.icon,
      withText: !buttonConfig.icon,
      isToggleable: true,
    });

    // Corner Case: `_self` is also on, if no target is set yet.
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
  #addButtons(actionsView: LinkActionsView, buttons: View[]): void {
    buttons.forEach((button) => {
      actionsView.element.insertBefore(button.element, actionsView.unlinkButtonView.element);
    });
  }
}

export default LinkTargetActionsViewExtension;
