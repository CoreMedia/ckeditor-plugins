import View from "../view/view";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";
import LabelView from "../label/labelview";

export type ViewCreator = (view: LabeledFieldView, labelViewUid: string, statusViewUid: string) => View;

export default class LabeledFieldView extends View {
  class: string;
  errorText: string | null;
  fieldView: View;
  infoText: string | null;
  readonly isEmpty: boolean;
  isEnabled: boolean;
  readonly isFocused: boolean;
  label: string;
  labelView: LabelView;
  placeholder: string;
  statusView: View;


  constructor(locale: Locale, viewCreator: ViewCreator);

  focus(): void;
}
