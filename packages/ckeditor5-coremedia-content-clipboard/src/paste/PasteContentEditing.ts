import { Plugin } from "ckeditor5";
import { reportInitEnd, reportInitStart } from "@coremedia/ckeditor5-core-common";
import { PasteContentCommand } from "./PasteContentCommand";

export default class PasteContentEditing extends Plugin {
  static readonly pluginName = "pasteContentEditing";
  static readonly pasteContentCommand = "pasteContentCommand";

  init() {
    const initInformation = reportInitStart(this);
    this.editor.commands.add(PasteContentEditing.pasteContentCommand, new PasteContentCommand(this.editor));
    reportInitEnd(initInformation);
  }
}
