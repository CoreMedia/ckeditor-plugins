import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import ContextualBalloon from "@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import { Options } from "@ckeditor/ckeditor5-utils/src/dom/position";
import CustomLinkTargetInputFormView from "./CustomLinkTargetInputFormView";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import Config from "@ckeditor/ckeditor5-utils/src/config";
import clickOutsideHandler from "@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler";
import { parseLinkTargetConfig } from "../config/LinkTargetConfig";
import { OTHER_TARGET_NAME, requireDefaultTargetDefinition } from "../config/DefaultTarget";
import LinkTargetOptionDefinition from "../config/LinkTargetOptionDefinition";
import { EditorWithUI } from "@ckeditor/ckeditor5-core/src/editor/editorwithui";
import Command from "@ckeditor/ckeditor5-core/src/command";

/**
 * Adds a button to the `LinkUI` for selecting a custom target, i.e., if
 * the button is pressed, an input field pops up to enter any string as
 * `linkTarget`.
 */
export default class CustomLinkTargetUI extends Plugin {
  static readonly pluginName: string = "CustomLinkTargetUI";

  static readonly customTargetButtonName: string = "customLinkTargetButton";

  #balloon: ContextualBalloon | undefined = undefined;
  /**
   * Form View to enter custom target. Initialized during `init`.
   */
  #form!: CustomLinkTargetInputFormView;
  /**
   * Names, which are bound to other target-selection buttons, and thus, are
   * perceived as _reserved names_. Such names must not show up in the edit
   * form, and they will be used to determine, if the `_other` button needs
   * to be _on_ or _off_.
   */
  #reservedTargetNames: Set<string> = new Set<string>();
  /**
   * LinkUI Plugin. Initialized on `init`.
   */
  linkUI!: LinkUI;

  static readonly requires = [ContextualBalloon, LinkUI];

  init(): Promise<void> | void {
    const editor = this.editor;
    const { otherNames, myConfig } = this.#parseConfig(editor.config);
    this.linkUI = <LinkUI>editor.plugins.get(LinkUI);
    this.#reservedTargetNames = new Set<string>(otherNames);
    this.#createButton(myConfig);
    this.#createForm();
  }

  /**
   * Parses the configuration to determine the desired behavior of `_other`
   * button.
   *
   * @param config - configuration to parse
   * @returns well-defined attribute values, which should not be handled by `_other` in `otherNames`;
   * button-configuration in `myConfig`
   */
  #parseConfig(config: Config): { otherNames: string[]; myConfig: Required<LinkTargetOptionDefinition> } {
    const linkTargetDefinitions = parseLinkTargetConfig(config);

    const otherNames = linkTargetDefinitions
      .map((definition): string => definition.name)
      .filter((name): boolean => name !== OTHER_TARGET_NAME);

    const myConfig: Required<LinkTargetOptionDefinition> = {
      // First provide some defaults, in case they don't exist in definition.
      ...requireDefaultTargetDefinition(OTHER_TARGET_NAME),
      // Now override with definition found in config.
      ...linkTargetDefinitions.find((definition) => definition.name === OTHER_TARGET_NAME),
    };

    return {
      otherNames: otherNames,
      myConfig: myConfig,
    };
  }

  /**
   * Creates a button showing the balloon panel for changing the link target and
   * registers it in the editor `ComponentFactory`.
   */
  #createButton(definition: Required<LinkTargetOptionDefinition>): void {
    const editor = this.editor;
    // @ts-expect-error TODO Handle missing command (see ifCommand etc.)
    const linkTargetCommand: Command = editor.commands.get("linkTarget");
    const reservedTargetNames = this.#reservedTargetNames;
    const t = editor.locale.t;
    // @ts-expect-error TODO Check, how to deal with editor without UI.
    const { ui }: EditorWithUI = editor;

    ui.componentFactory.add(CustomLinkTargetUI.customTargetButtonName, (locale: Locale) => {
      const view = new ButtonView(locale);

      view.set({
        label: t(definition.title),
        tooltip: true,
        icon: definition.icon,
        class: "cm-ck-target-button",
        isToggleable: true,
      });

      view.bind("isOn").to(linkTargetCommand, "value", (value: unknown) => {
        if (typeof value !== "string") {
          return false;
        }
        // As "fallback" the `_other` button is active, if no other button matched.
        return !reservedTargetNames.has(value);
      });

      /*
       * The tooltip changes if a custom target is set. We can determine this by checking the "isOn" value of the button.
       * Corner case: if the value is "_other", we'll display the default tooltip as well,
       * although it will open with an empty editor when clicked (as specified, as we may fix the orphaned value of
       * xlink:show="other" this way).
       */
      // @ts-expect-error TODO Check Typings
      view.bind("tooltip").to(view, "isOn", linkTargetCommand, "value", (isOn: boolean, value: string) => {
        if (isOn && value !== OTHER_TARGET_NAME) {
          return `${this.editor.locale.t(definition.title)}: "${this.editor.locale.t(value)}"`;
        }
        return true;
      });

      this.listenTo(view, "execute", () => {
        this.#showForm();
      });

      return view;
    });
  }

  /**
   * Creates the CustomLinkTargetInputFormView form.
   */
  #createForm(): void {
    const editor = this.editor;

    /**
     * The contextual balloon plugin instance.
     */
    this.#balloon = <ContextualBalloon>this.editor.plugins.get("ContextualBalloon");

    /**
     * A form containing a textarea and buttons, used to change the target value for "Open In Frame".
     */
    this.#form = new CustomLinkTargetInputFormView(editor.locale);

    // Render the form so its #element is available for clickOutsideHandler.
    this.#form.render();

    this.listenTo(this.#form, "submit", () => {
      const { value } = <HTMLInputElement>this.#form.labeledInput.fieldView.element;
      editor.execute("linkTarget", value);
      this.#hideForm(true);
    });

    this.listenTo(this.#form, "cancel", () => {
      this.#hideForm(true);
    });

    // Close the form on Esc key press.
    this.#form.keystrokes.set("Esc", (data: unknown, cancel: () => void) => {
      this.#hideForm(true);
      cancel();
    });

    // Close on click outside of balloon panel element.
    clickOutsideHandler({
      emitter: this.#form,
      activator: () => this.#isVisible,
      // @ts-expect-error TODO Handle possible null values.
      contextElements: [this.#balloon.view.element],
      callback: () => this.#hideForm(),
    });
  }

  /**
   * Opens a balloon and shows the {@link CustomLinkTargetUI.#form} in the {@link CustomLinkTargetUI.#balloon}.
   */
  #showForm(): void {
    if (this.#isVisible) {
      return;
    }

    const editor = this.editor;
    const linkTargetCommand = editor.commands.get("linkTarget");
    const labeledInput = this.#form.labeledInput;

    this.#form.disableCssTransitions();

    if (!this.#isInBalloon) {
      this.#balloon?.add({
        view: this.#form,
        position: this.#getBalloonPositionData(),
      });
    }

    const commandValue: string = <string | undefined>linkTargetCommand?.value || "";
    // For 'reserved targets' as current value, we still want to display an empty field.
    const initialValue: string =
      commandValue === OTHER_TARGET_NAME || this.#reservedTargetNames.has(commandValue) ? "" : commandValue;

    // Make sure that each time the panel shows up, the field remains in sync with the value of
    // the command. If the user typed in the input, then canceled the balloon (`labeledInput#value`
    // stays unaltered) and re-opened it without changing the value of the command, they would see the
    // old value instead of the actual value of the command.
    // https://github.com/ckeditor/ckeditor5-image/issues/114
    labeledInput.fieldView.value = (<HTMLInputElement>labeledInput.fieldView.element).value = initialValue;

    // @ts-expect-error TODO Check Typings/Usage
    this.#form.labeledInput.fieldView.select();

    this.#form.enableCssTransitions();
  }

  /**
   * Removes the {@link CustomLinkTargetUI.#form} from the {@link CustomLinkTargetUI.#balloon}.
   *
   * @param focusEditable - optional (defaults to false) Controls whether the editing view is focused afterwards.
   */
  #hideForm(focusEditable = false): void {
    if (!this.#isInBalloon) {
      return;
    }

    // Blur the input element before removing it from DOM to prevent issues in some browsers.
    // See https://github.com/ckeditor/ckeditor5/issues/1501.
    if (this.#form.focusTracker.isFocused) {
      this.#form.saveButtonView.focus();
    }

    this.#balloon?.remove(this.#form);

    if (focusEditable) {
      this.editor.editing.view.focus();
    }
  }

  /**
   * Returns `true` when the {@link CustomLinkTargetUI.#form} is the visible view in the {@link CustomLinkTargetUI.#balloon}.
   */
  get #isVisible(): boolean {
    return this.#balloon?.visibleView === this.#form;
  }

  /**
   * Returns `true` when the {@link CustomLinkTargetUI.#form} is in the {@link CustomLinkTargetUI.#balloon}.
   *
   * @returns true if the {@link CustomLinkTargetUI.#form} is in the {@link CustomLinkTargetUI.#balloon}
   */
  get #isInBalloon(): boolean {
    return this.#balloon?.hasView(this.#form) || false;
  }

  // we are relying on internal API here, this is kind of error-prone, but also the best shot we have
  // without reinventing the whole positioning logic of CKE balloons
  #getBalloonPositionData(): Options {
    // @ts-expect-error TODO Check Typings/Usage (most likely private API, we need to deal with somehow).
    return this.linkUI._getBalloonPositionData();
  }
}
