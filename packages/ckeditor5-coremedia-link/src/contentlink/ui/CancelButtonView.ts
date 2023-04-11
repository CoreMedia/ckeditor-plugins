import { Locale } from "@ckeditor/ckeditor5-utils";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import CoreMediaIconView from "./CoreMediaIconView";

/**
 * A CancelButton that uses the css class from CoreMedia Studio to display an icon
 */
export default class CancelButtonView extends ButtonView {
  readonly #cancelIcon: CoreMediaIconView;
  static readonly iconId = "cancelButtonIcon";

  constructor(locale?: Locale) {
    super(locale);

    this.extendTemplate({
      attributes: {
        class: ["cm-ck-cancel-button"],
      },
    });

    this.#cancelIcon = new CoreMediaIconView();
    this.#cancelIcon.set({
      id: CancelButtonView.iconId,
      iconClass: "cm-core-icons--remove",
    });
    this.children.add(this.#cancelIcon);
  }
}
