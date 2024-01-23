import { ButtonView, View, ViewCollection, submitHandler } from "@ckeditor/ckeditor5-ui";
import { KeystrokeHandler, type Locale } from "@ckeditor/ckeditor5-utils";
import { BindChain } from "@ckeditor/ckeditor5-ui/src/template";
import trashbinIcon from "../../theme/icons/trashbin.svg";
import "../../theme/blockedwordview.css";
import "../lang/blocklist";

/**
 * The blocked word view.
 * This view consists of a label and a button.
 * It shows a single word, that is part of the block list, based on the current selection inside the editor.
 * The word can be removed from the list via the button.
 */
export default class BlockedWordView extends View {
  readonly keystrokes = new KeystrokeHandler();

  /**
   * The Remove button view.
   */
  readonly #removeButtonView: ButtonView;

  /**
   * The Label, representing the blocked word.
   */
  readonly #blockedWordLabel: View;

  /**
   * A collection of child views in the form.
   */
  readonly children: ViewCollection;

  /**
   * A collection of views that can be focused in the form.
   */
  readonly #focusables = new ViewCollection();

  /**
   * The label of the header.
   */
  public declare label: string;

  constructor(locale: Locale) {
    super(locale);

    const bind = this.bindTemplate;

    this.children = this.createCollection();

    this.#removeButtonView = this.#createRemoveButton(locale);
    this.#blockedWordLabel = this.#createBlockedWordLabel(locale, bind);

    this.children.add(this.#blockedWordLabel);
    this.children.add(this.#removeButtonView);

    this.setTemplate({
      tag: "div",
      attributes: {
        class: ["ck", "cm-ck-blocklist-entry", "ck-form__header"],
      },
      children: this.children,
    });
  }

  public override render(): void {
    super.render();

    submitHandler({
      view: this,
    });

    this.#focusables.add(this.#removeButtonView);

    // Start listening for the keystrokes coming from #element.
    if (this.element) {
      this.keystrokes.listenTo(this.element);
    }
  }

  /**
   * @inheritDoc
   */
  public override destroy(): void {
    super.destroy();
    this.keystrokes.destroy();
  }

  /**
   * Focuses the remove button instead.
   */
  public focus(): void {
    this.#removeButtonView.focus();
  }

  /**
   * Creates the remove button view.
   *
   * @param locale The editor's locale.
   * @returns The button view instance.
   */
  #createRemoveButton(locale: Locale): ButtonView {
    const button = new ButtonView(this.locale);

    button.set({
      label: locale.t("Remove word from blocklist"),
      icon: trashbinIcon,
      tooltip: true,
    });

    button.extendTemplate({
      attributes: {
        class: "ck-button-cancel",
      },
    });

    button.on("execute", () => {
      this.fire("unblock", this.label);
    });

    return button;
  }

  #createBlockedWordLabel(locale: Locale, bind: BindChain<typeof this>): View {
    const label = new View(locale);

    label.setTemplate({
      tag: "h2",
      attributes: {
        class: ["ck", "ck-form__header__label"],
      },
      children: [{ text: bind.to("label") }],
    });

    return label;
  }
}

export interface UnblockEvent {
  name: "unblock";
  args: [string];
}
