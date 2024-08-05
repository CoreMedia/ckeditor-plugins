import {
  ButtonView,
  LabeledFieldView,
  View,
  ViewCollection,
  createLabeledInputText,
  submitHandler,
  InputTextView,
  KeystrokeHandler,
  Locale,
  icons,
} from "ckeditor5";
import "../lang/blocklist";

/**
 * A view, displaying an input field and a save button next to it.
 * This view is used to provide an input for words that should be saved as "blocked words".
 *
 * This view is controlled via the blocklistCommand and addToBlocklistCommand.
 */
export default class BlocklistInputView extends View {
  /**
   * An instance of the KeystrokeHandler.
   */
  readonly keystrokes = new KeystrokeHandler();

  /**
   * The URL input view.
   */
  wordToBlockInputView: LabeledFieldView<InputTextView>;

  /**
   * The Save button view.
   */
  saveButtonView: ButtonView;

  /**
   * A collection of child views in the form.
   */
  readonly children: ViewCollection;

  /**
   * Creates an instance of the views and initializes the focus management.
   *
   * @param locale - The editor's locale.
   */
  constructor(locale: Locale) {
    super(locale);
    this.wordToBlockInputView = this.#createWordToBlockInput(locale);
    this.saveButtonView = this.#createSaveButton(locale);
    this.children = this.#createFormChildren();
    this.#addInputEventListener();
    this.setTemplate({
      tag: "form",
      attributes: {
        class: ["ck", "cm-ck-blocklist-input", "ck-responsive-form"],
        tabindex: "-1",
      },
      children: this.children,
    });
  }
  public override render(): void {
    super.render();
    submitHandler({
      view: this,
    });

    // Start listening for the keystrokes coming from #element.
    if (this.element) {
      this.keystrokes.listenTo(this.element);
    }
  }
  #addInputEventListener(): void {
    const blockWordInput = this.getInputElement();
    blockWordInput.addEventListener("input", this.#validateAfterInputChange.bind(this));
  }
  #validateAfterInputChange(): void {
    const blockWordInput = this.getInputElement();
    const saveButton = this.saveButtonView;
    if (blockWordInput.value.length > 2) {
      saveButton.set("isEnabled", true);
    } else {
      saveButton.set("isEnabled", false);
    }
  }

  /**
   * Creates a labeled input view.
   *
   * @param locale - The editor's locale.
   * @returns Labeled field view instance.
   */
  #createWordToBlockInput(locale: Locale): LabeledFieldView<InputTextView> {
    const labeledInput = new LabeledFieldView(locale, createLabeledInputText);
    labeledInput.label = locale.t("Block");
    labeledInput.fieldView.placeholder = locale.t("Enter word to block");
    return labeledInput;
  }

  /**
   * Creates the save button view.
   *
   * @param locale - The editor's locale.
   * @returns The button view instance.
   */
  #createSaveButton(locale: Locale): ButtonView {
    const button = new ButtonView(this.locale);
    button.set({
      label: locale.t("Add word to blocklist"),
      icon: icons.check,
      isEnabled: false,
      type: "submit",
      tooltip: true,
    });
    button.extendTemplate({
      attributes: {
        class: "ck-button-save",
      },
    });
    return button;
  }

  /**
   * Populates the {@link #children} collection of the form.
   *
   * @returns The children of blocklist input form view.
   */
  #createFormChildren(): ViewCollection {
    const children = this.createCollection();
    children.add(this.wordToBlockInputView);
    children.add(this.saveButtonView);
    return children;
  }

  /**
   * Sets the value of the input element.
   * @param text - the new value
   */
  setInputText(text: string): void {
    this.getInputElement().value = text;
    this.#validateAfterInputChange();
  }

  /**
   * Returns the input element.
   */
  getInputElement(): HTMLInputElement {
    return this.wordToBlockInputView.fieldView.element as HTMLInputElement;
  }
}
