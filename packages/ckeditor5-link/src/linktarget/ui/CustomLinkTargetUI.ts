import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import ContextualBalloon from "@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import { Options } from "@ckeditor/ckeditor5-utils/src/dom/position";
import CustomLinkTargetInputFormView from "./CustomLinkTargetInputFormView";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import Config from "@ckeditor/ckeditor5-utils/src/config";
import clickOutsideHandler from "@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler";
import { parseLinkTargetConfig } from "../config/LinkTargetConfig";
import { OTHER_TARGET_NAME, requireDefaultTargetDefinition } from "../config/DefaultTarget";
import LinkTargetOptionDefinition from "../config/LinkTargetOptionDefinition";

export default class CustomLinkTargetUI extends Plugin {
  static readonly pluginName: string = "CustomLinkTargetUI";

  static readonly customTargetButtonName: string = "customLinkTargetButton";

  #balloon: ContextualBalloon | undefined = undefined;
  /**
   * Form View to enter custom target. Initialized during `init`.
   * @private
   */
  #form!: CustomLinkTargetInputFormView;
  /**
   * Names which are bound to other target-selection buttons, and thus, are
   * perceived as _reserved names_. Such names must not show up in the edit
   * form and they will be used to determine, if the `_other` button needs
   * to be _on_ or _off_.
   * @private
   */
  #reservedTargetNames: Set<string> = new Set<string>();
  /**
   * LinkUI Plugin. Initialized on `init`.
   */
  linkUI!: LinkUI;

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [ContextualBalloon, LinkUI];
  }

  init(): Promise<void> | null {
    const editor = this.editor;
    const { otherNames, myConfig } = this.#parseConfig(editor.config);
    this.linkUI = <LinkUI>editor.plugins.get(LinkUI);
    this.#reservedTargetNames = new Set<string>(otherNames);
    this.#createButton(myConfig);
    this.#createForm();
    return null;
  }

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
   * Creates a button showing the balloon panel for changing the image text alternative and
   * registers it in the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
   *
   * @private
   */
  #createButton(definition: Required<LinkTargetOptionDefinition>): void {
    const editor = this.editor;
    const linkTargetCommand = editor.commands.get("linkTarget");
    const reservedTargetNames = this.#reservedTargetNames;
    const t = editor.locale.t;

    editor.ui.componentFactory.add(CustomLinkTargetUI.customTargetButtonName, (locale: Locale) => {
      const view = new ButtonView(locale);

      view.set({
        label: t(definition.title),
        tooltip: true,
        icon: definition.icon,
        isToggleable: true,
      });

      view.bind("isOn").to(linkTargetCommand, "value", (value: string) => {
        if (value === undefined) {
          return false;
        }
        return !reservedTargetNames.has(value);
      });

      /*
       * The tooltip changes if a custom target is set. We can determine this by checking the "isOn" value of the button.
       * Corner case: if the value is "_other", we'll display the default tooltip as well.
       */
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
   *
   * @private
   */
  #createForm(): void {
    const editor = this.editor;

    /**
     * The contextual balloon plugin instance.
     *
     * @private
     */
    this.#balloon = <ContextualBalloon>this.editor.plugins.get("ContextualBalloon");

    /**
     * A form containing a textarea and buttons, used to change the `alt` text value.
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
    this.#form.keystrokes.set("Esc", (data: any, cancel: () => void) => {
      this.#hideForm(true);
      cancel();
    });

    // Close on click outside of balloon panel element.
    clickOutsideHandler({
      emitter: this.#form,
      activator: () => this.#isVisible,
      contextElements: [this.#balloon.view.element],
      callback: () => this.#hideForm(),
    });
  }

  /**
   * Shows the {@link #form} in the {@link #balloon}.
   *
   * @private
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

    this.#form.labeledInput.fieldView.select();

    this.#form.enableCssTransitions();
  }

  /**
   * Removes the {@link #form} from the {@link #balloon}.
   *
   * @param {Boolean} [focusEditable=false] Controls whether the editing view is focused afterwards.
   * @private
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
   * Returns `true` when the {@link #form} is the visible view in the {@link #balloon}.
   *
   * @private
   * @type {Boolean}
   */
  get #isVisible(): boolean {
    return this.#balloon?.visibleView === this.#form;
  }

  /**
   * Returns `true` when the {@link #form} is in the {@link #balloon}.
   *
   * @private
   * @type {Boolean}
   */
  get #isInBalloon(): boolean {
    return this.#balloon?.hasView(this.#form) || false;
  }

  // we are relying on internal API here, this is kind of error-prone, but also the best shot we have
  // without reinventing the whole positioning logic of CKE balloons
  #getBalloonPositionData(): Options {
    return this.linkUI._getBalloonPositionData();
  }
}
