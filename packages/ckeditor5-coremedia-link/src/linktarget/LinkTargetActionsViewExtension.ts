import { Plugin, Command } from "@ckeditor/ckeditor5-core";
import { LinkUI } from "@ckeditor/ckeditor5-link";
// LinkActionsView: See ckeditor/ckeditor5#12027.
import LinkActionsView from "@ckeditor/ckeditor5-link/src/ui/linkactionsview";
import { ButtonView, ToolbarSeparatorView, View, ContextualBalloon } from "@ckeditor/ckeditor5-ui";
import { parseLinkTargetConfig } from "./config/LinkTargetConfig";
import LinkTargetOptionDefinition from "./config/LinkTargetOptionDefinition";
import CustomLinkTargetUI from "./ui/CustomLinkTargetUI";
import { OTHER_TARGET_NAME } from "./config/DefaultTarget";
import "../../theme/linktargetactionsviewextension.css";
import { Locale } from "@ckeditor/ckeditor5-utils";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/src/Plugins";
import { handleFocusManagement } from "@coremedia/ckeditor5-link-common/src/FocusUtils";
import LoggerProvider from "@coremedia/ckeditor5-logging/src/logging/LoggerProvider";
import { requireNonNulls } from "@coremedia/ckeditor5-common/src/RequiredNonNull";

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
  static readonly #logger = LoggerProvider.getLogger(LinkTargetActionsViewExtension.pluginName);

  #initialized = false;

  init(): void {
    const initInformation = reportInitStart(this);
    const editor = this.editor;
    const linkUI: LinkUI = editor.plugins.get(LinkUI);
    const contextualBalloon: ContextualBalloon = editor.plugins.get(ContextualBalloon);
    contextualBalloon.on("change:visibleView", (evt, name, visibleView) => {
      if (visibleView && visibleView === linkUI.actionsView && !this.#initialized) {
        this.#extendView(linkUI);
        this.#initialized = true;
      }
    });

    reportInitEnd(initInformation);
  }

  /**
   * Extends the actions view of the linkUI plugin by adding target buttons right
   * before the {@link unlinkButtonView} element. The order of buttons is defined
   * by the editor's configuration, respectively the order of default targets
   * in {@link linktarget.config.DefaultTarget}.
   *
   * @param linkUI - the linkUI plugin
   */
  #extendView(linkUI: LinkUI): void {
    const { actionsView } = requireNonNulls(linkUI, "actionsView");
    const linkTargetCommand = linkUI.editor.commands.get("linkTarget");
    if (!linkTargetCommand) {
      LinkTargetActionsViewExtension.#logger.warn("Command 'linkTarget' not found");
      return;
    }
    const linkTargetDefinitions = parseLinkTargetConfig(this.editor.config);

    // convert button configurations to buttonView instances
    const buttons = linkTargetDefinitions.map((buttonConfig) => {
      if (buttonConfig.name === OTHER_TARGET_NAME) {
        return this.#createTargetOtherButton();
      } else {
        return this.#createTargetButton(linkUI.editor.locale, buttonConfig, linkTargetCommand);
      }
    });

    const separatorLeft: ToolbarSeparatorView & { class?: string } = new ToolbarSeparatorView();
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
      this.#addButtons(actionsView, [separatorLeft, ...buttons, separatorRight]);
    }

    LinkTargetActionsViewExtension.#render(actionsView, buttons);
  }

  static #render(actionsView: LinkActionsView, addedButtons: View[]): void {
    handleFocusManagement(actionsView, addedButtons, actionsView.unlinkButtonView, "before");
  }

  /**
   * Creates a button for `other` behavior, which is, that you can enter any
   * custom target value in an extra dialog.
   */
  #createTargetOtherButton(): ButtonView {
    const { ui } = this.editor;
    return ui.componentFactory.create(CustomLinkTargetUI.customTargetButtonName) as ButtonView;
  }

  /**
   * Creates and returns an instance of a buttonView for link target representation.
   * The buttons are bound to {@link LinkTargetCommand} to set the target on execute
   * and toggle their state accordingly.
   *
   * Buttons created by this method directly set the target value they are bound
   * to. For a custom target input field, use `CustomLinkTargetUI`.
   *
   * @param locale - the locale used for localization.
   * @param buttonConfig - configuration for the button
   * @param linkTargetCommand - command to execute on click
   */
  #createTargetButton(
    locale: Locale,
    buttonConfig: LinkTargetOptionDefinition,
    linkTargetCommand: Command,
  ): ButtonView {
    const view = new ButtonView();
    view.set({
      label: buttonConfig.title ? locale.t(buttonConfig.title) : locale.t(buttonConfig.name),
      class: "cm-ck-target-button",
      tooltip: true,
      icon: buttonConfig.icon,
      withText: !buttonConfig.icon,
      isToggleable: true,
    });

    // Corner Case: `_self` is also on if target is not yet set.
    view
      .bind("isOn")
      .to(
        linkTargetCommand,
        "value",
        (value: unknown) => value === buttonConfig.name || (value === undefined && buttonConfig.name === "_self"),
      );

    view.bind("isEnabled").to(linkTargetCommand);

    view.on("execute", () => {
      linkTargetCommand?.execute(buttonConfig.name);
    });

    return view;
  }

  /**
   * Adds button elements right before the {@link unlinkButtonView} element in the actions view.
   *
   * @param actionsView - CKEditor's `LinkActionsView` to extend
   * @param buttons - the buttons to add in the given order
   */
  #addButtons(actionsView: LinkActionsView, buttons: View[]): void {
    const viewElement = actionsView.element;
    if (!viewElement) {
      return;
    }
    buttons.forEach((button) => {
      // @ts-expect-error Possibly wrong typing for insertBefore?
      viewElement.insertBefore(button.element, actionsView.unlinkButtonView.element);
    });
  }
}

export default LinkTargetActionsViewExtension;
