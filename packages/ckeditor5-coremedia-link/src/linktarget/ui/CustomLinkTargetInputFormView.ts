import View from "@ckeditor/ckeditor5-ui/src/view";
import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import ViewCollection from "@ckeditor/ckeditor5-ui/src/viewcollection";
import { createLabeledInputText } from "@ckeditor/ckeditor5-ui//src/labeledfield/utils";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import FocusTracker from "@ckeditor/ckeditor5-utils/src/focustracker";
import KeystrokeHandler from "@ckeditor/ckeditor5-utils/src/keystrokehandler";
import FocusCycler from "@ckeditor/ckeditor5-ui/src/focuscycler";
import injectCssTransitionDisabler from "@ckeditor/ckeditor5-ui/src/bindings/injectcsstransitiondisabler";
import { Emitter } from "@ckeditor/ckeditor5-utils/src/emittermixin";
import submitHandler from "@ckeditor/ckeditor5-ui/src/bindings/submithandler";
import "@ckeditor/ckeditor5-ui/theme/components/responsive-form/responsiveform.css";
import InputTextView from "@ckeditor/ckeditor5-ui/src/inputtext/inputtextview";
import "../../../theme/customlinktargetform.css";
import { icons } from "@ckeditor/ckeditor5-core/src/index";

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

  constructor(locale: Locale) {
    super(locale);

    const t = this.locale.t;

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
    this.saveButtonView = this.#createButton(t("Save"), icons.check, "ck-button-save");
    this.saveButtonView.type = "submit";

    /**
     * A button used to cancel the form.
     */
    this.cancelButtonView = this.#createButton(t("Cancel"), icons.cancel, "ck-button-cancel", "cancel");

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
    const t = this.locale.t;
    const labeledInput: LabeledFieldView<InputTextView> = new LabeledFieldView(this.locale, createLabeledInputText);
    labeledInput.label = t("Target");
    return labeledInput;
  }
}
