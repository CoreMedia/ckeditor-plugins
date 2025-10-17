import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import { LoggerProvider } from "@coremedia/ckeditor5-logging";
import type { Command } from "ckeditor5";
import { ButtonView, LinkUI, Plugin } from "ckeditor5";
import { OTHER_TARGET_NAME } from "./config/DefaultTarget";
import "../../theme/linktargetactionsviewextension.css";
import { parseLinkTargetConfig } from "./config/LinkTargetConfig";
import type LinkTargetOptionDefinition from "./config/LinkTargetOptionDefinition";
import CustomLinkTargetUI from "./ui/CustomLinkTargetUI";

/**
 * Extends the action view of the linkUI plugin for link target display. This includes:
 *
 * * render toggle buttons in the action view of the linkUI to indicate the set target of a given link
 * * executing a button will result in setting the target of a given link
 *
 * When clicking the "Open in Frame" button, an additional balloon with a text input
 * opens and allows setting a custom target.
 *
 * The buttons to be rendered can be set in the editor's configuration.
 * The default configuration is defined in {@link linktarget.config.DefaultTarget}.
 */
class LinkTargetActionsViewExtension extends Plugin {
  public static readonly pluginName = "LinkTargetActionsViewExtension" as const;
  static readonly requires = [LinkUI, CustomLinkTargetUI];
  static readonly #logger = LoggerProvider.getLogger("LinkTargetActionsViewExtension");

  init(): void {
    const initInformation = reportInitStart(this);
    const editor = this.editor;
    const linkUI: LinkUI = editor.plugins.get(LinkUI);
    this.#registerComponents(linkUI);
    reportInitEnd(initInformation);
  }

  #registerComponents(linkUI: LinkUI): void {
    const linkTargetCommand = linkUI.editor.commands.get("linkTarget");
    if (!linkTargetCommand) {
      LinkTargetActionsViewExtension.#logger.warn("Command 'linkTarget' not found");
      return;
    }

    // register all custom and default link target buttons
    const linkTargetDefinitions = parseLinkTargetConfig(this.editor.config);
    linkTargetDefinitions.forEach((buttonConfig) => {
      if (buttonConfig.name && buttonConfig.name !== OTHER_TARGET_NAME) {
        this.#addTargetButton(buttonConfig, linkTargetCommand);
      }
    });
  }

  /**
   * Creates an instance of a buttonView for link target representation and
   * registers it in the editor's component factory.
   * The button is bound to {@link LinkTargetCommand} to set the target on execute
   * and toggle their state accordingly.
   *
   * Buttons created by this method directly set the target value they are bound
   * to. For a custom target input field, use `CustomLinkTargetUI`.
   *
   * @param buttonConfig - configuration for the button
   * @param linkTargetCommand - command to execute on click
   */
  #addTargetButton(buttonConfig: LinkTargetOptionDefinition, linkTargetCommand: Command): void {
    const editor = this.editor;
    editor.ui.componentFactory.add(buttonConfig.name, (locale) => {
      const button = new ButtonView(locale);
      const t = locale.t;

      button.set({
        label: buttonConfig.title ? t(buttonConfig.title) : t(buttonConfig.name),
        class: "cm-ck-target-button",
        tooltip: true,
        icon: buttonConfig.icon,
        withText: !buttonConfig.icon,
        isToggleable: true,
      });

      // Corner Case: `_self` is also on if target is not yet set.
      button
        .bind("isOn")
        .to(
          linkTargetCommand,
          "value",
          (value: unknown) => value === buttonConfig.name || (value === undefined && buttonConfig.name === "_self"),
        );
      button.bind("isEnabled").to(linkTargetCommand);
      button.on("execute", () => {
        linkTargetCommand?.execute(buttonConfig.name);
      });

      return button;
    });
  }
}

export default LinkTargetActionsViewExtension;
