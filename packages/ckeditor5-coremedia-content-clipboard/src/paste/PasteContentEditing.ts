import { Plugin } from "@ckeditor/ckeditor5-core";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common/Plugins";
import { PasteContentCommand } from "./PasteContentCommand";

export default class PasteContentEditing extends Plugin {
  init() {
    const initInformation = reportInitStart(this);
    this.editor.commands.add("pasteContentCommand", new PasteContentCommand(this.editor));
    reportInitEnd(initInformation);
  }
}
