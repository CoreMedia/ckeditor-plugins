import { ButtonView, Plugin, createDropdown, addToolbarToDropdown } from "ckeditor5";
// @ts-expect-error no idea why
import ltrIcon from "../theme/icons/ltr.svg";
// @ts-expect-error no idea why
import rtlIcon from "../theme/icons/rtl.svg";
import type { TextDirectionOption } from "./utils";

const icons = new Map<TextDirectionOption, unknown>([
  ["ltr", ltrIcon],
  ["rtl", rtlIcon],
]);

/**
 * The text direction UI plugin.
 */
export class TextDirectionUI extends Plugin {
  get localizedOptionTitles() {
    const t = this.editor.t;

    return {
      ltr: t("Left to right"),
      rtl: t("Right to left"),
    };
  }

  /**
   * @inheritDoc
   */
  static get pluginName() {
    return "TextDirectionUI";
  }

  /**
   * @inheritDoc
   */
  init() {
    const editor = this.editor;
    const componentFactory = editor.ui.componentFactory;
    const t = editor.t;
    const options = ["ltr", "rtl"] as const;

    options?.forEach((option) => this._addButton(option));

    componentFactory.add("textDirection", (locale) => {
      const dropdownView = createDropdown(locale);

      // Add existing text direction buttons to dropdown's toolbar.
      const buttons: ButtonView[] = options?.length
        ? options.map((option) => componentFactory.create(`textDirection:${option}`) as ButtonView)
        : [];
      addToolbarToDropdown(dropdownView, buttons);

      // Configure dropdown properties an behavior.
      dropdownView.buttonView.set({
        label: t("Text direction"),
        tooltip: true,
      });

      if (dropdownView.toolbarView) {
        dropdownView.toolbarView.isVertical = true;
        dropdownView.toolbarView.ariaLabel = t("Text direction toolbar");
      }

      dropdownView.extendTemplate({
        attributes: {
          class: "ck-direction-dropdown",
        },
      });

      // The default icon depends on the direction of the content.
      const defaultIcon = locale.contentLanguageDirection === "rtl" ? rtlIcon : ltrIcon;

      // Change icon to reflect current selection's text direction.
      dropdownView.buttonView.bind("icon").toMany(buttons, "isOn", (...areActive) => {
        // Get the index of an active button.
        const index = areActive.findIndex((value) => value);

        // If none of the commands is active, display either defaultIcon or the first button's icon.
        if (index < 0) {
          return defaultIcon;
        }

        // Return active button's icon.
        return buttons[index]?.icon;
      });

      // Enable button if any of the buttons is enabled.
      dropdownView
        .bind("isEnabled")
        .toMany(buttons, "isEnabled", (...areEnabled) => areEnabled.some((isEnabled) => isEnabled));

      return dropdownView;
    });
  }

  /**
   * Helper method for initializing the button and linking it with an appropriate command.
   *
   * @private
   * @param {String} option The name of the dir option for which the button is added.
   */
  _addButton(option: TextDirectionOption) {
    const editor = this.editor;

    editor.ui.componentFactory.add(`textDirection:${option}`, (locale) => {
      const command = editor.commands.get("textDirection");
      const buttonView = new ButtonView(locale);

      buttonView.set({
        label: this.localizedOptionTitles[option],
        icon: icons.get(option),
        tooltip: true,
        isToggleable: true,
      });

      if (command) {
        // Bind button model to command.
        buttonView.bind("isEnabled").to(command);
        buttonView.bind("isOn").to(command, "value", (value) => value === option);
      }

      // Execute command.
      this.listenTo(buttonView, "execute", () => {
        editor.execute("textDirection", { value: option });
        editor.editing.view.focus();
      });

      return buttonView;
    });
  }
}
