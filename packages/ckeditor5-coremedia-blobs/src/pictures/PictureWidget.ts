import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import PictureWidgetUI from "./PictureWidgetUI";
import PictureWidgetEditing from "./PictureWidgetEditing";

export default class PictureWidget extends Plugin {
  static get requires() {
    return [PictureWidgetEditing, PictureWidgetUI];
  }
}
