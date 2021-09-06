import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import ContextualBalloon from "@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon";
import Editor from "@ckeditor/ckeditor5-core/src/editor/editor";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import CustomLinkTargetInputFormView from "./CustomLinkTargetInputFormView";
import LinkUI from "@ckeditor/ckeditor5-link/src/linkui";
import clickOutsideHandler from "@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler";
import { parseLinkTargetConfig } from "../config/LinkTargetConfig";
import { OTHER_TARGET_NAME } from "../config/DefaultTarget";

export default class CustomLinkTargetUI extends Plugin {
  _balloon: ContextualBalloon | undefined = undefined;
  _form: any;
  linkUI: LinkUI | undefined = undefined;

  static readonly pluginName: string = "CustomLinkTargetUI";

  static readonly customTargetButtonName: string = "customLinkTargetButton";

  static get requires(): Array<new (editor: Editor) => Plugin> {
    return [ContextualBalloon, LinkUI];
  }

  init(): Promise<void> | null {
    this.linkUI = <LinkUI>this.editor.plugins.get(LinkUI);
    this.#createButton();
    this.#createForm();
    return null;
  }

  /**
   * Creates a button showing the balloon panel for changing the image text alternative and
   * registers it in the editor {@link module:ui/componentfactory~ComponentFactory ComponentFactory}.
   *
   * @private
   */
  #createButton(): void {
    const editor = this.editor;
    const linkTargetCommand = editor.commands.get("linkTarget");
    const linkTargetDefinitions = parseLinkTargetConfig(this.editor.config);
    const t = editor.locale.t;

    editor.ui.componentFactory.add(CustomLinkTargetUI.customTargetButtonName, (locale: Locale) => {
      const view = new ButtonView(locale);

      const definition = linkTargetDefinitions.find((def) => def.name === OTHER_TARGET_NAME);
      view.set({
        label: t(definition?.title || "Custom Link Target"),
        tooltip: true,
        withText: true,
        isToggleable: true,
      });

      view.bind("isOn").to(linkTargetCommand, "value", (value: string) => {
        if (value === undefined) {
          return false;
        }
        return linkTargetDefinitions.filter((def) => def.name === value && def.name !== OTHER_TARGET_NAME).length === 0;
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
    this._balloon = <ContextualBalloon>this.editor.plugins.get("ContextualBalloon");

    /**
     * A form containing a textarea and buttons, used to change the `alt` text value.
     */
    this._form = new CustomLinkTargetInputFormView(editor.locale);

    // Render the form so its #element is available for clickOutsideHandler.
    this._form.render();

    this.listenTo(this._form, "submit", () => {
      editor.execute("linkTarget", this._form.labeledInput.fieldView.element.value);
      this.#hideForm(true);
    });

    this.listenTo(this._form, "cancel", () => {
      this.#hideForm(true);
    });

    // Close the form on Esc key press.
    this._form.keystrokes.set("Esc", (data: any, cancel: () => void) => {
      this.#hideForm(true);
      cancel();
    });

    // Reposition the balloon or hide the form if an image widget is no longer selected.
    this.listenTo(editor.ui, "update", () => {
      //TODO
      //console.log("update has been triggered, see LinkTargetInputView");
      /*if (!imageUtils.getClosestSelectedImageWidget(viewDocument.selection)) {
        this.#hideForm(true);
      } else if (this._isVisible) {
        repositionContextualBalloon(editor);
      }*/
    });

    // Close on click outside of balloon panel element.
    clickOutsideHandler({
      emitter: this._form,
      activator: () => this._isVisible,
      contextElements: [this._balloon.view.element],
      callback: () => this.#hideForm(),
    });
  }

  /**
   * Shows the {@link #_form} in the {@link #_balloon}.
   *
   * @private
   */
  #showForm() {
    if (this._isVisible) {
      return;
    }

    const editor = this.editor;
    const linkTargetCommand = editor.commands.get("linkTarget");
    const labeledInput = this._form.labeledInput;

    this._form.disableCssTransitions();

    if (!this._isInBalloon) {
      this._balloon?.add({
        view: this._form,
        position: this.#getBalloonPositionData(),
      });
    }

    // Make sure that each time the panel shows up, the field remains in sync with the value of
    // the command. If the user typed in the input, then canceled the balloon (`labeledInput#value`
    // stays unaltered) and re-opened it without changing the value of the command, they would see the
    // old value instead of the actual value of the command.
    // https://github.com/ckeditor/ckeditor5-image/issues/114
    labeledInput.fieldView.value = labeledInput.fieldView.element.value = linkTargetCommand?.value || "";

    this._form.labeledInput.fieldView.select();

    this._form.enableCssTransitions();
  }

  /**
   * Removes the {@link #_form} from the {@link #_balloon}.
   *
   * @param {Boolean} [focusEditable=false] Controls whether the editing view is focused afterwards.
   * @private
   */
  #hideForm(focusEditable = false): void {
    if (!this._isInBalloon) {
      return;
    }

    // Blur the input element before removing it from DOM to prevent issues in some browsers.
    // See https://github.com/ckeditor/ckeditor5/issues/1501.
    if (this._form.focusTracker.isFocused) {
      this._form.saveButtonView.focus();
    }

    this._balloon?.remove(this._form);

    if (focusEditable) {
      this.editor.editing.view.focus();
    }
  }

  /**
   * Returns `true` when the {@link #_form} is the visible view in the {@link #_balloon}.
   *
   * @private
   * @type {Boolean}
   */
  get _isVisible() {
    return this._balloon?.visibleView === this._form;
  }

  /**
   * Returns `true` when the {@link #_form} is in the {@link #_balloon}.
   *
   * @private
   * @type {Boolean}
   */
  get _isInBalloon() {
    return this._balloon?.hasView(this._form);
  }

  // we are relying on internal API here, this is kind of error-prone, but also the best shot we have
  // without reinventing the whole positioning logic of CKE balloons
  #getBalloonPositionData() {
    return this.linkUI?._getBalloonPositionData();
  }
}
