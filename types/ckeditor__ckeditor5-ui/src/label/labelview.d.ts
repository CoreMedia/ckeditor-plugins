import View from "../view/view";
import Locale from "@ckeditor/ckeditor5-utils/src/locale";

export default class LabelView extends View {
  for: string;
  id: string;
  text: string;

  constructor(locale?: Locale);
}
