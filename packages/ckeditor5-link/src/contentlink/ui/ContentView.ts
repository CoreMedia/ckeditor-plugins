import View from "@ckeditor/ckeditor5-ui/src/view";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import IconView from "@ckeditor/ckeditor5-ui/src/icon/iconview";
//@ts-ignore
import link from "@ckeditor/ckeditor5-link/theme/icons/link.svg";

/**
 * A ContentView that renders a custom template, containing of 2 different components.
 * The itemView displays the information of a content item and the cancelButton renders a button
 * that can be used to remove the displayed content.
 */
export default class ContentView extends View {
  readonly _itemView: ButtonView;
  readonly _buttonView: ButtonView;

  constructor(locale: Locale) {
    super(locale);

    const bind = this.bindTemplate;

    /**
     * The value of the content.
     *
     * @observable
     * @member {String} #value
     * @default undefined
     */
    this.set("value", undefined);

    /**
     * Controls whether the input view is in read-only mode.
     *
     * @observable
     * @member {Boolean} #isReadOnly
     * @default false
     */
    this.set("isReadOnly", false);

    /**
     * Set to `true` when the field has some error. Usually controlled via
     * {@link module:ui/labeledinput/labeledinputview~LabeledInputView#errorText}.
     *
     * @observable
     * @member {Boolean} #hasError
     * @default false
     */
    this.set("hasError", false);

    /**
     * The `id` of the element describing this field. When the field has
     * some error, it helps screen readers read the error text.
     *
     * @observable
     * @member {Boolean} #ariaDescribedById
     */
    this.set("ariaDescribedById");

    /**
     * An instance of the item view that displays the content's information.
     */
    this._itemView = this.#createItemView(locale);

    /**
     * An instance of the cancel button allowing the user to dismiss the content.
     */
    this._buttonView = this.#createButtonView(locale);

    this.setTemplate({
      tag: "div",
      attributes: {
        class: ["ck", "cm-ck-content-field-view", bind.if("hasError", "ck-error")],
        id: bind.to("id"),
        "aria-invalid": bind.if("hasError", true),
        "aria-describedby": bind.to("ariaDescribedById"),
      },
      children: [this._itemView, this._buttonView],
    });
  }

  #createItemView(locale: Locale): ButtonView {
    const contentLinkButton = new ButtonView(locale);
    // TODO in case we want to display an icon class, we also need an element with these classes:
    // cm-core-icons cm-core-icons--create-content  cm-core-icons--100

    contentLinkButton.set({
      label: "Albini Dress",
      class: ["cm-ck-item-button"],
      icon: link,
      tooltip: true,
      withText: true,
    });

    contentLinkButton.iconView = new IconView(locale);

    contentLinkButton.bind("label").to(this, "value", (value: string) => {
      // TODO[serviceagent] add service agent here
      return value;
    });

    return contentLinkButton;
  }

  #createButtonView(locale: Locale): ButtonView {
    const cancelButton = new ButtonView(locale);
    cancelButton.set({
      label: "x",
      keystroke: "Ctrl+B",
      tooltip: true,
      withText: true,
    });

    return cancelButton;
  }
}
