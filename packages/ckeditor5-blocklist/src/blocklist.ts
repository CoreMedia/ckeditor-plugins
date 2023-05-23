import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Blocklistui from "./blocklistui";
import BlocklistEditing from "./blocklistediting";

export default class Blocklist extends Plugin {
  static readonly pluginName: string = "Blocklist";
  static readonly requires = [BlocklistEditing, Blocklistui];
}
