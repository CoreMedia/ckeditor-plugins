import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import Blocklistui from "./blocklistui";
import BlocklistEditing from "./blocklistediting";

export default class Blocklist extends Plugin {
  public static readonly pluginName = "Blocklist" as const;
  static readonly requires = [BlocklistEditing, Blocklistui];
}
