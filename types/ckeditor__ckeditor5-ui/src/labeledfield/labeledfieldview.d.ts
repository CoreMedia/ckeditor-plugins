import View from "../view";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import LabelView from "../label/labelview";

export type ViewCreator<T extends View> = (view: LabeledFieldView<T>, labelViewUid: string, statusViewUid: string) => T;

export default class LabeledFieldView<T extends View = View & { value: string }> extends View {
  class: string;
  errorText: string | null;
  fieldView: T;
  infoText: string | null;
  readonly isEmpty: boolean;
  isEnabled: boolean;
  readonly isFocused: boolean;
  label: string;
  labelView: LabelView;
  placeholder: string;
  statusView: View;


  constructor(locale: Locale, viewCreator: ViewCreator<T>);

  focus(): void;
}
