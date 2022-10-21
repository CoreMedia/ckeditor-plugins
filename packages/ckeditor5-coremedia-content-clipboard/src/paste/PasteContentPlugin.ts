import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

import PasteContentUI from "./PasteContentUI";
import PasteContentEditing from "./PasteContentEditing";

export default class PasteContentPlugin extends Plugin {
  static get requires() {
    return [PasteContentEditing, PasteContentUI];
  }
}
