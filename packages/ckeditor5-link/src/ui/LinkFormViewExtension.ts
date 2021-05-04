import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
import { createLabeledInputText } from "@ckeditor/ckeditor5-ui//src/labeledfield/utils";
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import View from "@ckeditor/ckeditor5-ui/src/view";

/**
 * Extends the LinkFormView of the CKEditor Link Plugin by additional form
 * fields.
 */
export default class LinkFormViewExtension {
  readonly locale: Locale;
  readonly linkFormView: LinkFormView;
  readonly targetInputView: LabeledFieldView;

  constructor(linkFormView: LinkFormView) {
    this.linkFormView = linkFormView;
    this.locale = linkFormView.locale;

    this.targetInputView = this._createTargetInput();

    linkFormView.once("render", () => this.render());
  }

  render(): void {
    // TODO[cke] Do we require a switch, if LinkTarget Plugin is enabled or not?
    this.targetInputView.render();
    this.linkFormView.registerChild(this.targetInputView);
    this.insertAfter(this.targetInputView, this.linkFormView.urlInputView);
  }

  private insertAfter(newView: View, refChild: View): void {
    this.linkFormView.element.insertBefore(newView.element, refChild.element.nextSibling);
  }

  private _createTargetInput(): LabeledFieldView {
    const t = this.locale.t;
    const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
    labeledInput.label = t("Link Target");
    return labeledInput;
  }

  destroy(): void {
    this.targetInputView.destroy();
  }
}
