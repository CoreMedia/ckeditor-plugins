import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";
//@ts-ignore
import DropdownView from "@ckeditor/ckeditor5-ui/src/dropdown/dropdownview";
//@ts-ignore
import ToolbarView from "@ckeditor/ckeditor5-ui/src/toolbar/toolbarview";
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
//@ts-ignore
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import ContentView from "./ContentView";
import createInternalLinkView from "./InternalLinkView";
import Command from "@ckeditor/ckeditor5-core/src/command";
import { extractContentCkeModelUri } from "@coremedia/coremedia-studio-integration/content/DragAndDropUtils";

/**
 * Extends the LinkFormView of the CKEditor Link Plugin by additional form
 * fields.
 */
export default class LinkFormViewExtension {
  readonly locale: Locale;
  readonly linkFormView: LinkFormView;
  readonly internalLinkView: LabeledFieldView<ContentView>;
  readonly linkBehaviorView: LabeledFieldView<InputTextView>;
  readonly targetInputView: LabeledFieldView<DropdownView>;

  constructor(linkFormView: LinkFormView, linkCommand: Command | undefined) {
    this.linkFormView = linkFormView;
    this.linkFormView.urlInputView.element.addEventListener("drop", (dragEvent: DragEvent) => {
      const contentCkeModelUri = extractContentCkeModelUri(dragEvent);
      if (contentCkeModelUri === null) {
        return;
      }
      (dragEvent.target as HTMLInputElement).value = contentCkeModelUri;
    });
    this.locale = linkFormView.locale;
    this.internalLinkView = createInternalLinkView(this.locale, linkFormView, linkCommand);
    this.targetInputView = this._createTargetInput();
    this.linkBehaviorView = this._createLinkBehaviorField();

    this.targetInputView
      .bind("isEnabled")
      .to(this.linkBehaviorView, "linkBehavior", (value: string) => value === LINK_BEHAVIOR.OPEN_IN_FRAME);

    linkFormView.once("render", () => this.render());
  }

  render(): void {
    // TODO this is just rendered to perform a drop test
    const dropTestButton = new ButtonView(this.locale);
    dropTestButton.set({
      label: "Drop Content",
      tooltip: true,
      withText: true,
    });
    dropTestButton.on("execute", () => {
      this.internalLinkView.fieldView.set({
        value: "content:12345",
      });
    });
    this.renderAfter(dropTestButton, this.linkFormView.urlInputView);
    this.renderAfter(this.targetInputView, this.linkFormView.urlInputView);
    this.renderAfter(this.linkBehaviorView, this.linkFormView.urlInputView);
    this.renderAfter(this.internalLinkView, this.linkFormView.urlInputView);
  }

  private renderAfter(view: View, after: View) {
    this.linkFormView.registerChild(view);
    if (!view.isRendered) {
      view.render();
    }
    this.insertAfter(view, after);
  }

  private insertAfter(newView: View, refChild: View): void {
    this.linkFormView.element.insertBefore(newView.element, refChild.element.nextSibling);
  }

  private _createTargetInput(): LabeledFieldView<InputTextView> {
    const t = this.locale.t;
    const labeledInput = new LabeledFieldView(this.locale, createLabeledInputText);
    labeledInput.label = t("Target");
    /*
     * Define observable attribute `hiddenTarget`. This attribute holds the
     * original target, while being in a state, where the target field is
     * disabled. This allows editors to toggle from "Open in Frame" to another
     * behavior back and forth, while any target set originally is remembered.
     */
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
      label: t("Behavior"),
      linkBehavior: LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB,
    });

    linkBehaviorDropdown.fieldView.buttonView.set({
      isOn: false,
      withText: true,
      tooltip: t("Link Behavior"),
    });

    linkBehaviorDropdown.fieldView.buttonView.bind("label").to(linkBehaviorDropdown, "linkBehavior", (value: any) => {
      return linkBehaviorLabels[value ? value : LINK_BEHAVIOR.OPEN_IN_CURRENT_TAB];
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
