import Plugin from "@ckeditor/ckeditor5-core/src/plugin";

import PasteContentUI from "./PasteContentUI";
import PasteContentEditing from "./PasteContentEditing";

/**
 * Glue plugin for the Paste Content Feature.
 *
 * Includes the PasteContentUI (the button) and PasteContentEditing (the command).
 */
export default class PasteContentPlugin extends Plugin {
  static get requires() {
    return [PasteContentEditing, PasteContentUI];
  }
}
