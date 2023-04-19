import {
  View,
  LabeledFieldView,
  ButtonView,
  ViewCollection,
  FocusCycler,
  injectCssTransitionDisabler,
  submitHandler,
  InputTextView,
} from "@ckeditor/ckeditor5-ui";
import { createLabeledInputText } from "@ckeditor/ckeditor5-ui//src/labeledfield/utils";
import { Locale, FocusTracker, KeystrokeHandler } from "@ckeditor/ckeditor5-utils";
import { Emitter } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import "@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css";
import "../../../theme/customlinktargetform.css";
import { icons, Command } from "@ckeditor/ckeditor5-core";

/**
 * The CustomLinkTargetInputFormView class is a basic view with a few child items.
 * It is used to edit a custom target.
 * It consists of a basic input field (with label) and two buttons (save & cancel)
 * Keystrokes and focus are handled accordingly.
 */
export default class CustomLinkTargetInputFormView extends View {
  readonly focusTracker: FocusTracker;
  readonly keystrokes: KeystrokeHandler;
  readonly labeledInput: LabeledFieldView<InputTextView>;
  readonly saveButtonView: ButtonView;
  readonly cancelButtonView: ButtonView;
  readonly #focusables: ViewCollection;
  readonly #focusCycler: FocusCycler;

  // declared, because we extend this view by calling {@link injectCssTransitionDisabler} later on
  declare enableCssTransitions: () => void;
  declare disableCssTransitions: () => void;

  constructor(linkTargetCommand: Command, locale?: Locale) {
    super(locale);

    const t = this.locale?.t;

    /**
     * Tracks information about the DOM focus in the form.
     *
     * @readonly
     */
    this.focusTracker = new FocusTracker();

    /**
     * An instance of the {@link KeystrokeHandler}.
     *
     * @readonly
     */
    this.keystrokes = new KeystrokeHandler();

    /**
     * The target input.
     */
    this.labeledInput = this.#createLabeledInputView();

    /**
     * A button used to submit the form.
     */
    this.saveButtonView = this.#createButton(t?.("Save") ?? "Save", icons.check, "ck-button-save");
    this.saveButtonView.type = "submit";

    // Required for concurrent editing: If we are at editing a custom target
    // and content changes to read-only we must not be able to save anymore.
    this.saveButtonView.bind("isEnabled").to(linkTargetCommand);

    /**
     * A button used to cancel the form.
     */
    this.cancelButtonView = this.#createButton(t?.("Cancel") ?? "Cancel", icons.cancel, "ck-button-cancel", "cancel");

    /**
     * A collection of views, which can be focused in the form.
     *
     * @readonly
     */
    this.#focusables = new ViewCollection();

    /**
     * Helps to cycle over focusables in the form.
     * The focusCycler determines, which focusables exist and how to cycle between them.
     *
     * @readonly
     */
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
        class: ["ck", "cm-ck-custom-link-target-form", "ck-responsive-form"],

        // https://github.com/ckeditor/ckeditor5-image/issues/40
        tabindex: "-1",
      },

      children: [this.labeledInput, this.saveButtonView, this.cancelButtonView],
    });

    // TODO[cke] Address Deprecation
    injectCssTransitionDisabler(this);
  }

  /**
   * We need to handle key inputs and focus management for the view and its items
   * This is done similar to how CKEditor does this in their own plugins.
   */
  override render(): void {
    super.render();

    // types expect an Emitter here, but listenTo() also works with HTMLElements.
    // We need to cast to unknown first because types are not overlapping sufficiently
    this.keystrokes.listenTo(this.element as unknown as Emitter);

    submitHandler({ view: this });

    [this.labeledInput, this.saveButtonView, this.cancelButtonView].forEach((v) => {
      // Register the view as focusable.
      this.#focusables.add(v);

      // Register the view in the focus tracker.
      // @ts-expect-error TODO Handle Element being null.
      this.focusTracker.add(v.element);
    });
  }

  /**
   * Creates the button view.
   *
   * @param label - The button label
   * @param icon - The button's icon.
   * @param className - The additional button CSS class name.
   * @param eventName - The event name that the ButtonView#execute event will be delegated to.
   * @returns {@link ButtonView} The button view instance.
   */
  #createButton(label: string, icon: string, className: string, eventName?: string): ButtonView {
    const button = new ButtonView(this.locale);

    button.set({
      label,
      icon,
      tooltip: true,
    });

    button.extendTemplate({
      attributes: {
        class: className,
      },
    });

    if (eventName) {
      button.delegate("execute").to(this, eventName);
    }

    return button;
  }

  /**
   * Creates the target input with a corresponding label.
   *
   * @returns {@link LabeledFieldView} Labeled field view instance.
   */
  #createLabeledInputView(): LabeledFieldView<InputTextView> {
    const t = this.locale?.t;
    const labeledInput = new LabeledFieldView<InputTextView>(this.locale, createLabeledInputText);
    labeledInput.label = t?.("Target") ?? "Target";
    return labeledInput;
  }
}
