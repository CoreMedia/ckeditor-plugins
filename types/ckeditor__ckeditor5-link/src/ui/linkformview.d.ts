import View from "@ckeditor/ckeditor5-ui/src/view";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import { PriorityString } from "@ckeditor/ckeditor5-utils/src/priorities";
import LinkCommand from "../linkcommand";
import ButtonView from "@ckeditor/ckeditor5-ui/src/button/buttonview";
import LabeledFieldView from "@ckeditor/ckeditor5-ui/src/labeledfield/labeledfieldview";

type DecoratorSwitchesStates = {
  [decorator: string]: boolean,
};

/**
 * @see <a href="https://ckeditor.com/docs/ckeditor5/latest/api/module_link_ui_linkformview-LinkFormView.html">Class LinkFormView (link/ui/linkformview~LinkFormView) - CKEditor 5 API docs</a>
 */
export default class LinkFormView extends View {
  cancelButtonView: ButtonView;
  saveButtonView: ButtonView;
  urlInputView: LabeledFieldView;

  constructor(locale: Locale, linkCommand: LinkCommand);

  getDecoratorSwitchesState(): DecoratorSwitchesStates;

  render(): void;

  focus(): void;

  once(event: string, callback: Function, options?: { priority: PriorityString | number }): void;
}
