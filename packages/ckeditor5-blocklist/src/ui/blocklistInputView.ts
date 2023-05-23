import {
  ButtonView,
  FocusCycler,
  LabeledFieldView,
  View,
  ViewCollection,
  createLabeledInputText,
  submitHandler,
  type InputTextView,
} from "@ckeditor/ckeditor5-ui";
import { FocusTracker, KeystrokeHandler, type Locale } from "@ckeditor/ckeditor5-utils";
import { icons } from "@ckeditor/ckeditor5-core";
import "../lang/blocklist";

/**
 * A view, displaying an input field and a save button next to it.
 * This view is used to provide an input for words that should be saved as "blocked words".
 *
 * This view is controlled via the blocklistCommand and addToBlocklistCommand.
 */
export default class BlocklistInputView extends View {
  /**
   * Tracks information about DOM focus in the form.
   */
  readonly focusTracker = new FocusTracker();

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
   * A collection of views that can be focused in the form.
   */
  readonly #focusables = new ViewCollection();

  readonly #focusCycler: FocusCycler;

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

    this.#focusCycler = new FocusCycler({
      focusables: this.#focusables,
      focusTracker: this.focusTracker,
      keystrokeHandler: this.keystrokes,
      actions: {
        // Navigate form fields backwards using the Shift + Tab keystroke.
        focusPrevious: "shift + tab",

        // Navigate form fields forwards using the Tab key.
        focusNext: "tab",
      },
    });

    this.setTemplate({
      tag: "form",

      attributes: {
        class: ["ck", "cm-ck-blocklist-input", "ck-responsive-form"],

        // https://github.com/ckeditor/ckeditor5-link/issues/90
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

    const childViews = [this.wordToBlockInputView, this.saveButtonView];

    childViews.forEach((childView) => {
      // Register the view as focusable.
      this.#focusables.add(childView);

      // Register the view in the focus tracker.
      if (childView.element) {
        this.focusTracker.add(childView.element);
      }
    });

    // Start listening for the keystrokes coming from #element.
    if (this.element) {
      this.keystrokes.listenTo(this.element);
    }
  }

  public override destroy(): void {
    super.destroy();

    this.focusTracker.destroy();
    this.keystrokes.destroy();
  }

  /**
   * Focuses the fist focusable in the form.
   */
  public focus(): void {
    this.#focusCycler.focusFirst();
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
}
