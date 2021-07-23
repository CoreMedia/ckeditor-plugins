import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import CoreMediaIconView from "./CoreMediaIconView";

/**
 * A CancelButton that uses the css class from CoreMedia Studio to display an icon
 */
export default class CancelButtonView extends ButtonView {
  readonly _cancelIcon: CoreMediaIconView;
  constructor(locale: Locale) {
    super(locale);

    this.extendTemplate({
      attributes: {
        class: ["ck-cm-cancel-button"],
      },
    });

    this._cancelIcon = new CoreMediaIconView();
    this._cancelIcon.set({
      iconClass: "cm-core-icons--remove",
    })
    this.children.add(this._cancelIcon);
  }
}
