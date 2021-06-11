import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
//@ts-ignore
import DropdownView from "@ckeditor/ckeditor5-ui/src/dropdown/dropdownview";
//@ts-ignore
import { createDropdown, addListToDropdown } from "@ckeditor/ckeditor5-ui/src/dropdown/utils";
import { createLabeledInputText, createLabeledDropdown } from "@ckeditor/ckeditor5-ui//src/labeledfield/utils";
import LinkFormView from "@ckeditor/ckeditor5-link/src/ui/linkformview";
import View from "@ckeditor/ckeditor5-ui/src/view";

//@ts-ignore
import Model from "@ckeditor/ckeditor5-ui/src/model";
//@ts-ignore
import Collection from "@ckeditor/ckeditor5-utils/src/collection";
import InputTextView from "@ckeditor/ckeditor5-ui/src/inputtext/inputtextview";
import { getLinkBehaviorLabels, LINK_BEHAVIOR } from "../utils";

/**
 * Extends the LinkFormView of the CKEditor Link Plugin by additional form
 * fields.
 */
export default class LinkFormViewExtension {
  readonly locale: Locale;
  readonly linkFormView: LinkFormView;
  readonly linkBehaviorView: LabeledFieldView<InputTextView>;
  readonly targetInputView: LabeledFieldView<DropdownView>;

  constructor(linkFormView: LinkFormView) {
    this.linkFormView = linkFormView;
    this.locale = linkFormView.locale;

    this.targetInputView = this._createTargetInput();
    this.linkBehaviorView = this._createLinkBehaviorField();

    this.targetInputView
      .bind("isEnabled")
      .to(this.linkBehaviorView, "linkBehavior", (value: string) => value === LINK_BEHAVIOR.OPEN_IN_FRAME);

    linkFormView.once("render", () => this.render());
  }

  render(): void {
    // TODO[cke] Do we require a switch, if LinkTarget Plugin is enabled or not?
    this.linkFormView.registerChild(this.linkBehaviorView);
    this.linkFormView.registerChild(this.targetInputView);
    if (!this.targetInputView.isRendered) {
      this.targetInputView.render();
    }
    if (!this.linkBehaviorView.isRendered) {
      this.linkBehaviorView.render();
    }
    this.insertAfter(this.targetInputView, this.linkFormView.urlInputView);
    this.insertAfter(this.linkBehaviorView, this.linkFormView.urlInputView);
  }

  private insertAfter(newView: View, refChild: View): void {
    this.linkFormView.element.insertBefore(newView.element, refChild.element.nextSibling);
  }

  private _createTargetInput(): LabeledFieldView<InputTextView> {
    const t = this.locale.t;
    const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
    labeledInput.label = t("Link Target");
    labeledInput.set({
      hiddenTarget: "",
    });

    labeledInput.fieldView
      .bind("value")
      .to(labeledInput, "hiddenTarget", labeledInput, "isEnabled", (value: string, isEnabled: boolean) => {
        return isEnabled ? value : "";
      });

    labeledInput.fieldView.on("input", (evt: any) => {
      //@ts-ignore
      labeledInput.hiddenTarget = evt.source.element.value;
    });
    return labeledInput;
  }

  private _createLinkBehaviorField(): LabeledFieldView<DropdownView> {
    const locale = this.locale;
    const t = locale.t;

    const linkBehaviorLabels = getLinkBehaviorLabels(t);
    const linkBehaviorDropdown = new LabeledFieldView(locale, createLabeledDropdown);
    linkBehaviorDropdown.set({
      label: t("Link Behavior"),
      linkBehavior: LINK_BEHAVIOR.DEFAULT,
    });

    linkBehaviorDropdown.fieldView.buttonView.set({
      isOn: false,
      withText: true,
      tooltip: t("Link Behavior"),
    });

    linkBehaviorDropdown.fieldView.buttonView.bind("label").to(linkBehaviorDropdown, "linkBehavior", (value: any) => {
      return linkBehaviorLabels[value ? value : LINK_BEHAVIOR.OPEN_IN_NEW_TAB];
    });

    linkBehaviorDropdown.fieldView.on("execute", (evt: any) => {
      //@ts-ignore
      linkBehaviorDropdown.linkBehavior = evt.source._linkBehaviorValue;
    });

    linkBehaviorDropdown.bind("isEmpty").to(linkBehaviorDropdown, "linkBehavior", (value: any) => !value);
    linkBehaviorDropdown.fieldView.bind("value").to(linkBehaviorDropdown, "linkBehavior");
    addListToDropdown(linkBehaviorDropdown.fieldView, this._getLinkBehaviorDefinitions(this));

    return linkBehaviorDropdown;
  }

  private _getLinkBehaviorDefinitions = (view: any) => {
    const itemDefinitions = new Collection();
    const linkBehaviorLabels = getLinkBehaviorLabels(view.locale.t);

    for (const linkBehaviorKey in linkBehaviorLabels) {
      const definition = {
        type: "button",
        model: new Model({
          _linkBehaviorValue: linkBehaviorKey,
          label: linkBehaviorLabels[linkBehaviorKey],
          withText: true,
        }),
      };
      itemDefinitions.add(definition);
    }

    return itemDefinitions;
  };

  destroy(): void {
    this.linkBehaviorView.destroy();
    this.targetInputView.destroy();
  }
}
