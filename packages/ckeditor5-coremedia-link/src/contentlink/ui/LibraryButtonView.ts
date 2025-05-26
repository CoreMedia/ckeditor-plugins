import { Locale, ButtonView } from "ckeditor5";
import CoreMediaIconView from "./CoreMediaIconView";

/**
 * A LibraryButton that uses the css class from CoreMedia Studio to display an icon
 */
export default class LibraryButtonView extends ButtonView {
  readonly #libraryIcon: CoreMediaIconView;
  static readonly iconId = "libraryButtonIcon";

  constructor(onClick: () => void, tooltip: string, locale?: Locale) {
    super(locale);
    this.extendTemplate({
      attributes: {
        class: ["cm-ck-library-button"],
      },
    });
    this.set("tooltip", tooltip);
    this.#libraryIcon = new CoreMediaIconView();
    this.#libraryIcon.set({
      id: LibraryButtonView.iconId,
      iconClass: "cm-core-icons--library",
    });
    this.children.add(this.#libraryIcon);
    this.on("execute", onClick);
  }
}
